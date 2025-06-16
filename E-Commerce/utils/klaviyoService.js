var config = require('../config/environment/index');
const axios = require('axios');

var klaviyoService = function() {}
const getHeaders = () => ({
    'accept': 'application/json',
    'revision': '2025-01-15',
    'content-type': 'application/json',
    'Authorization': `Klaviyo-API-Key ${config.klaviyo.private_key}`
});

klaviyoService.prototype.addOrderToStore = async function (orderData, customer, utm = {}, type = "Placed Order") {
    return new Promise(async (resolve, reject) => {
        try {
            const email = customer.shipping_email ? customer.shipping_email : customer.email;
            const phone = customer.shipping_telephone ? customer.shipping_telephone : customer.telephone;
            const country = customer.shipping_country ? customer.shipping_country : customer.country;

            const profileData = {
                data: {
                    type: "profile",
                    attributes: {
                        email: email,
                        first_name: customer.shipping_first_name ? customer.shipping_first_name : customer.first_name,
                        last_name: customer.shipping_last_name ? customer.shipping_last_name : customer.last_name,
                        phone_number: phone,
                        location: {
                            address1: customer.shipping_address ? customer.shipping_address : customer.address,
                            city: customer.shipping_city ? customer.shipping_city : customer.city,
                            zip: customer.shipping_postcode ? customer.shipping_postcode : customer.postcode,
                            country: country
                        }
                    }
                }
            };

            // Handle profile creation or update
            await this.ensureProfileExists(email, profileData);

            // Then track the order event
            let items = [];
            let itemsNames = [];
            
            if (orderData.therapies && Array.isArray(orderData.therapies)) {
                items = orderData.therapies.map(t => {
                    const quantity = t.quantity && t.product_quantity ? parseFloat(t.quantity * t.product_quantity) : 
                                   t.quantity ? parseFloat(t.quantity) : 0;
                    const price_per_unit = t.reduced_price || 0;
                    const total_price = quantity * price_per_unit;
                    
                    const item = {
                        ProductID: t.category || '',
                        ProductName: t.product_name || '',
                        Quantity: parseFloat(quantity),
                        ItemPrice: parseFloat(price_per_unit),
                        RowTotal: parseFloat(total_price),
                        ImageURL: t.display_image && t.display_image.link ? t.display_image.link : '',
                        Categories: t.category || '',
                        Brand: "E-Commerce"
                    };
                    
                    return item;
                }).filter(item => {
                    // Accept items even if quantity or price is 0, just ensure we have a name
                    const isValid = Boolean(item.ProductName);
                    if (!isValid) {
                        console.log('Filtered out item without name:', JSON.stringify(item, null, 2));
                    }
                    return isValid;
                });
                
                itemsNames = items.map(item => item.ProductName).filter(Boolean);
            }

            const properties = {
                $event_id: orderData.order_id2,
                $value: Number(parseFloat(orderData.eur_value || 0).toFixed(2)),
                value_currency: "EUR",
                OrderId: orderData.order_id2,
                DiscountValue: Number(parseFloat(orderData.discount || 0).toFixed(2)),
                Country: customer.shipping_country || ''
            };

            // Only add optional properties if they have values
            if (orderData.discountData && orderData.discountData.name) {
                properties.DiscountCode = orderData.discountData.name;
            } else if (orderData.discount_code) {
                properties.DiscountCode = orderData.discount_code;
            }

            if (itemsNames.length > 0) {
                properties.ItemNames = itemsNames;
            }

            if (items.length > 0) {
                properties.Items = items;
            }

            let eventData = {
                data: {
                    type: "event",
                    attributes: {
                        metric: {
                            data: {
                                type: "metric",
                                attributes: {
                                    name: type
                                }
                            }
                        },
                        profile: {
                            data: {
                                type: "profile",
                                attributes: {
                                    email: email
                                }
                            }
                        },
                        properties,
                        time: new Date().toISOString()
                    }
                }
            };

            try {
                const response = await axios.post(
                    `https://a.klaviyo.com/api/events`, 
                    eventData, 
                    { headers: getHeaders() }
                );
                
                resolve(response.data);
            } catch (err) {
                if (err.type === 'invalid-json') {
                    console.error('Invalid JSON response from Klaviyo API');
                    resolve(null); // Resolve with null since the event was likely tracked despite the invalid response
                } else {
                    throw err;
                }
            }
        } catch (err) {
            console.error('Error in addOrderToStore:', err);
            return reject(err);
        }
    });
};

// Helper method to ensure a profile exists
klaviyoService.prototype.ensureProfileExists = async function(email, profileData) {
    try {
        // First try to get the profile
        const profileResponse = await axios.get(
            `https://a.klaviyo.com/api/profiles?filter=equals(email,"${encodeURIComponent(email)}")`, 
            { headers: getHeaders() }
        );
        
        const profileResult = profileResponse.data;
        
        if (profileResult.data && profileResult.data.length > 0) {
            // Profile exists, update it
            const profileId = profileResult.data[0].id;
            profileData.data.id = profileId;
            
            await axios.patch(
                `https://a.klaviyo.com/api/profiles/${profileId}`, 
                profileData, 
                { headers: getHeaders() }
            );
        } else {
            // No profile exists, create new one
            await axios.post(
                'https://a.klaviyo.com/api/profiles', 
                profileData, 
                { headers: getHeaders() }
            );
        }
    } catch (error) {
        if (error.response?.status === 409) {
            // Handle race condition - profile was created between our check and create
            const errorBody = error.response.data;
            const existingProfileId = errorBody.errors[0].meta.duplicate_profile_id;
            
            profileData.data.id = existingProfileId;
            await axios.patch(
                `https://a.klaviyo.com/api/profiles/${existingProfileId}`, 
                profileData, 
                { headers: getHeaders() }
            );
        } else if (error.message.includes('duplicate_profile')) {
            // Another type of duplicate profile error
            const retryResponse = await axios.get(
                `https://a.klaviyo.com/api/profiles?filter=equals(email,"${encodeURIComponent(email)}")`, 
                { headers: getHeaders() }
            );
            
            if (retryResponse.data.data && retryResponse.data.data.length > 0) {
                const profileId = retryResponse.data.data[0].id;
                profileData.data.id = profileId;
                
                await axios.patch(
                    `https://a.klaviyo.com/api/profiles/${profileId}`, 
                    profileData, 
                    { headers: getHeaders() }
                );
            } else {
                throw error;
            }
        } else {
            throw error;
        }
    }
};

klaviyoService.prototype.addSubscriberToList = async function (email, countryCode) {
    return new Promise(async (resolve, reject) => {
        try {
            email = email.toLowerCase();
            const headers = getHeaders();

            // First, check if the profile exists
            let profileId;
            try {
                const profileResponse = await axios.get(
                    `https://a.klaviyo.com/api/profiles?filter=equals(email,"${encodeURIComponent(email)}")`, 
                    { headers }
                );
                
                const profileResult = profileResponse.data;
                
                // If profile doesn't exist, create it
                if (!profileResult.data || profileResult.data.length === 0) {
                    const profileData = {
                        data: {
                            type: "profile",
                            attributes: {
                                email: email,
                                location: {
                                    country: countryCode
                                }
                            }
                        }
                    };

                    const createResponse = await axios.post(
                        'https://a.klaviyo.com/api/profiles', 
                        profileData, 
                        { headers }
                    );

                    profileId = createResponse.data.data.id;
                } else {
                    // Profile exists, get its ID
                    profileId = profileResult.data[0].id;
                }
            } catch (error) {
                console.error('Profile search/creation error:', error.response?.data || error.message);
                throw new Error(`Failed to search/create profile: ${error.message}`);
            }

            // Check if the profile is already in the list using email
            try {
                const listCheckResponse = await axios.get(
                    `https://a.klaviyo.com/api/lists/${config.klaviyo.websiteListId}/relationships/profiles?filter=equals(email,"${encodeURIComponent(email)}")`,
                    { headers }
                );
                
                const listCheckResult = listCheckResponse.data;

                // If profile is not in the list, add it
                if (!listCheckResult.data || listCheckResult.data.length === 0) {
                    const listData = {
                        data: [
                            {
                                type: "profile",
                                id: profileId
                            }
                        ]
                    };

                    await axios.post(
                        `https://a.klaviyo.com/api/lists/${config.klaviyo.websiteListId}/relationships/profiles`,
                        listData,
                        { headers }
                    );

                    resolve({ message: 'Profile added to list successfully' });
                } else {
                    resolve({ message: 'Profile already exists in the list' });
                }
            } catch (error) {
                console.error('List check/update error:', error.response?.data || error.message);
                throw new Error(`Failed with list operations: ${error.message}`);
            }
        } catch (err) {
            return reject(err);
        }
    });
};
klaviyoService.prototype.fulfilledOrder = async function (orderData, customer, utm = {}) {
    return new Promise(async (resolve, reject) => {
        try {
            let items = [];
            let itemsNames = [];
            
            if (orderData.therapies && Array.isArray(orderData.therapies)) {
                items = orderData.therapies.map(t => {
                    const quantity = t.quantity && t.product_quantity ? parseFloat(t.quantity * t.product_quantity) : 
                                   t.quantity ? parseFloat(t.quantity) : 0;
                    const price_per_unit = t.reduced_price || 0;
                    const total_price = quantity * price_per_unit;
                    return {
                        ProductID: t.id || '',
                        ProductName: t.name || '',
                        Quantity: parseFloat(quantity),
                        ItemPrice: parseFloat(price_per_unit),
                        RowTotal: parseFloat(total_price),
                        ImageURL: t.display_image && t.display_image.link ? t.display_image.link : '',
                        Categories: t.category || '',
                        Brand: "E-Commerce"
                    }
                }).filter(item => item.ProductName); // Only include items with a name
                
                itemsNames = items.map(item => item.ProductName).filter(Boolean);
            }

            const properties = {
                event_id: orderData.order_id2,
                value: Number(parseFloat(orderData.total || 0).toFixed(2)),
                value_currency: "EUR",
                OrderId: orderData.order_id2,
                DiscountValue: Number(parseFloat(orderData.discount || 0).toFixed(2))
            };

            // Only add optional properties if they have values
            if (orderData.discount_code) {
                properties.DiscountCode = orderData.discount_code;
            }

            if (itemsNames.length > 0) {
                properties.ItemNames = itemsNames;
            }

            if (items.length > 0) {
                properties.Items = items;
            }

            let eventData = {
                data: {
                    type: "event",
                    attributes: {
                        metric: {
                            data: {
                                type: "metric",
                                attributes: {
                                    name: "Fulfilled Order"
                                }
                            }
                        },
                        profile: {
                            data: {
                                type: "profile",
                                attributes: {
                                    email: customer.email
                                }
                            }
                        },
                        properties,
                        time: new Date().toISOString()
                    }
                }
            };
            
            try {
                const response = await axios.post(
                    `https://a.klaviyo.com/api/events`,
                    eventData,
                    { headers: getHeaders() }
                );
                
                resolve(response.data);
            } catch (err) {
                if (err.type === 'invalid-json') {
                    console.error('Invalid JSON response from Klaviyo API');
                    resolve(null); // Resolve with null since the event was likely tracked despite the invalid response
                } else {
                    console.error('Event tracking error:', err.response?.data || err.message);
                    throw new Error(`Failed to track order event: ${err.message}`);
                }
            }
        } catch (err) {
            console.error('Error in fulfilledOrder:', err);
            return reject(err);
        }
    });
};
module.exports = new klaviyoService();
