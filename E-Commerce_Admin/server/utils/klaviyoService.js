var config = require('../config/environment/index');
const fetch = require('node-fetch');
const crypto = require('crypto');

var klaviyoService = function() {}
const getHeaders = () => ({
    'accept': 'application/json',
    'revision': '2025-01-15',
    'content-type': 'application/json',
    'Authorization': `Klaviyo-API-Key ${config.klaviyo.private_key}`
});

klaviyoService.prototype.getSubscription = async function (email) {
    return new Promise(async (resolve, reject) => {
        try {
            email = email.toLowerCase();
            let params = {
                method: 'GET',
                headers: getHeaders()
            };
            
            
            // First get the profile ID using the email
            const profileResponse = await fetch(`https://a.klaviyo.com/api/profiles?filter=equals(email,"${encodeURIComponent(email)}")`, params);
            
            // Log the full response for debugging
            const responseText = await profileResponse.text();
            
            if (!profileResponse.ok) {
                console.error('Klaviyo profile search error:', responseText);
                throw new Error(`Klaviyo profile search failed with status ${profileResponse.status}`);
            }
            
            // Parse the response text as JSON after logging it
            const profileData = JSON.parse(responseText);
            
            if (profileData.data && profileData.data.length > 0) {
                const profileId = profileData.data[0].id;
                
                // Get all lists the profile is subscribed to using the relationships link
                const listsResponse = await fetch(profileData.data[0].relationships.lists.links.related, params);
                if (!listsResponse.ok) {
                    console.error('Klaviyo lists error:', await listsResponse.text());
                    throw new Error(`Klaviyo lists failed with status ${listsResponse.status}`);
                }
                const listsData = await listsResponse.json();
                
                // Get all segments the profile belongs to using the relationships link
                const segmentsResponse = await fetch(profileData.data[0].relationships.segments.links.related, params);
                if (!segmentsResponse.ok) {
                    console.error('Klaviyo segments error:', await segmentsResponse.text());
                    throw new Error(`Klaviyo segments failed with status ${segmentsResponse.status}`);
                }
                const segmentsData = await segmentsResponse.json();
                
                // Get list memberships from profile relationships
                const listMembershipsResponse = await fetch(profileData.data[0].relationships.lists.links.self, params);
                if (!listMembershipsResponse.ok) {
                    console.error('Klaviyo list memberships error:', await listMembershipsResponse.text());
                    throw new Error(`Klaviyo list memberships failed with status ${listMembershipsResponse.status}`);
                }
                const listMembershipsData = await listMembershipsResponse.json();

                // Format lists data with subscription status
                const lists = (listsData.data || []).map(list => {
                    // Check if the list ID exists in the memberships data
                    const isMember = listMembershipsData.data?.some(membership => membership.id === list.id);
                    return {
                        id: list.id,
                        name: list.attributes.name,
                        status: isMember ? 'subscribed' : 'unsubscribed'
                    };
                });
                
                // Format segments data with active status
                const segments = (segmentsData.data || []).map(segment => ({
                    id: segment.id,
                    name: segment.attributes.name,
                    is_active: segment.attributes.is_active,
                    is_starred: segment.attributes.is_starred
                }));
                
                // Check if subscribed to any list
                const isSubscribedToAny = lists.some(list => list.status === 'subscribed');
                
                // Get active segments and lists for display
                const activeSegments = segments.filter(segment => segment.is_active)
                    .map(segment => segment.name)
                    .sort();
                
                const subscribedLists = lists.filter(list => list.status === 'subscribed')
                    .map(list => list.name)
                    .sort();
                
                resolve({
                    email_address: profileData.data[0].attributes.email,
                    status: isSubscribedToAny ? 'subscribed' : 'unsubscribed',
                    id: profileData.data[0].id,
                    merge_fields: {
                        country: profileData.data[0].attributes.location?.country || ''
                    },
                    lists: lists,
                    segments: segments,
                    // Add new fields for display
                    active_segments: activeSegments,
                    subscribed_lists: subscribedLists
                });
            } else {
                // No subscriber found
                resolve({
                    status: 404
                });
            }
        } catch (err) {
            console.error('Error in getSubscription:', err);
            reject(err);
        }
    });
};

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

            try {
                // First try to get the profile
                const profileResponse = await fetch(`https://a.klaviyo.com/api/profiles?filter=equals(email,"${encodeURIComponent(email)}")`, {
                    method: 'GET',
                    headers: getHeaders()
                });
                
                if (!profileResponse.ok) {
                    console.error('Klaviyo profile search error:', await profileResponse.text());
                    throw new Error(`Klaviyo profile search failed with status ${profileResponse.status}`);
                }
                
                const profileResult = await profileResponse.json();
                
                if (profileResult.data && profileResult.data.length > 0) {
                    // Profile exists, update it
                    const profileId = profileResult.data[0].id;
                    profileData.data.id = profileId;
                    const updateResponse = await fetch(`https://a.klaviyo.com/api/profiles/${profileId}`, {
                        method: 'PATCH',
                        headers: getHeaders(),
                        body: JSON.stringify(profileData)
                    });
                    
                    if (!updateResponse.ok) {
                        const errorText = await updateResponse.text();
                        console.error('Profile update error response:', errorText);
                        throw new Error(`Failed to update profile: ${errorText}`);
                    }
                } else {
                    // No profile exists, create new one
                    const createResponse = await fetch('https://a.klaviyo.com/api/profiles', {
                        method: 'POST',
                        headers: getHeaders(),
                        body: JSON.stringify(profileData)
                    });
                    
                    if (createResponse.status === 409) {
                        // Handle race condition - profile was created between our check and create
                        const errorBody = await createResponse.json();
                        const existingProfileId = errorBody.errors[0].meta.duplicate_profile_id;
                        
                        profileData.data.id = existingProfileId;
                        const updateResponse = await fetch(`https://a.klaviyo.com/api/profiles/${existingProfileId}`, {
                            method: 'PATCH',
                            headers: getHeaders(),
                            body: JSON.stringify(profileData)
                        });
                        
                        if (!updateResponse.ok) {
                            const errorText = await updateResponse.text();
                            console.error('Profile update error response:', errorText);
                            throw new Error(`Failed to update profile: ${errorText}`);
                        }
                    } else if (!createResponse.ok) {
                        const errorText = await createResponse.text();
                        console.error('Profile creation error response:', errorText);
                        throw new Error(`Failed to create profile: ${errorText}`);
                    }
                }
            } catch (err) {
                if (err.message.includes('duplicate_profile')) {
                    const profileResponse = await fetch(`https://a.klaviyo.com/api/profiles?filter=equals(email,"${encodeURIComponent(email)}")`, {
                        method: 'GET',
                        headers: getHeaders()
                    });
                    const profileResult = await profileResponse.json();
                    
                    if (profileResult.data && profileResult.data.length > 0) {
                        const profileId = profileResult.data[0].id;
                        profileData.data.id = profileId;
                        const updateResponse = await fetch(`https://a.klaviyo.com/api/profiles/${profileId}`, {
                            method: 'PATCH',
                            headers: getHeaders(),
                            body: JSON.stringify(profileData)
                        });
                        
                        if (!updateResponse.ok) {
                            const errorText = await updateResponse.text();
                            console.error('Profile update error response:', errorText);
                            throw new Error(`Failed to update profile: ${errorText}`);
                        }
                    } else {
                        throw err;
                    }
                } else {
                    throw err;
                }
            }

            // Then track the order event
            let items = [];
            let itemsNames = [];
            
            
            if (orderData.therapies && Array.isArray(orderData.therapies)) {
                items = orderData.therapies.map(t => {
                    
                    const quantity = t.quantity && t.product_quantity ? parseFloat(t.quantity * t.product_quantity) : 
                                   t.quantity ? parseFloat(t.quantity) : 0;
                    const total_price = t.total_price ? parseFloat(t.total_price) : 0;
                    const price_per_unit = quantity > 0 ? total_price / quantity : 0;
                    
                    const item = {
                        ProductID: t.id || t.category || '',
                        ProductName: t.name || t.product_name || '',
                        Quantity: quantity,
                        ItemPrice: price_per_unit,
                        RowTotal: total_price,
                        ImageURL: t.display_image && t.display_image.link ? t.display_image.link : '',
                        Categories: t.category || '',
                        Brand: "E-commerce"
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
            } else {
            }

            const properties = {
                event_id: orderData.order_id2,
                value: Number(parseFloat(orderData.eur_value || 0).toFixed(2)),
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
                const response = await fetch(`https://a.klaviyo.com/api/events`, {
                    method: 'POST',
                    headers: getHeaders(),
                    body: JSON.stringify(eventData)
                });
                
                const responseText = await response.text();
                
                if (!response.ok) {
                    console.error('Event tracking error response:', responseText);
                    throw new Error(`Failed to track order event: ${responseText}`);
                }
                
                const responseBody = responseText ? JSON.parse(responseText) : null;
                resolve(responseBody);
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

klaviyoService.prototype.handleSubscription = async function (email, merge_fields, newSubscriberStatus) {
    return new Promise(async (resolve, reject) => {
        try {
            email = email.toLowerCase();
            let params = {
                method: 'GET',
                headers: getHeaders()
            };
            
            
            // First get the profile ID using the email
            const profileResponse = await fetch(`https://a.klaviyo.com/api/profiles?filter=equals(email,"${encodeURIComponent(email)}")`, params);
            if (!profileResponse.ok) {
                console.error('Klaviyo profile search error:', await profileResponse.text());
                throw new Error(`Klaviyo profile search failed with status ${profileResponse.status}`);
            }
            const profileData = await profileResponse.json();
            
            if (profileData.data && profileData.data.length > 0) {
                const profileId = profileData.data[0].id;
                
                // Update subscription for the main list
                let data = {
                    data: {
                        type: "profile",
                        id: profileId,
                        attributes: {
                            email: email,
                            ...merge_fields
                        }
                    }
                };
                
                // First update the profile
                let updateProfileParams = {
                    method: 'PATCH',
                    headers: getHeaders(),
                    body: JSON.stringify(data)
                };
                
                const profileUpdateResponse = await fetch(`https://a.klaviyo.com/api/profiles/${profileId}`, updateProfileParams);
                if (!profileUpdateResponse.ok) {
                    console.error('Klaviyo profile update error:', await profileUpdateResponse.text());
                    throw new Error(`Klaviyo profile update failed with status ${profileUpdateResponse.status}`);
                }
                
            } else {
                // If no profile exists, create one and set subscription
                let data = {
                    data: {
                        type: "profile",
                        attributes: {
                            email: email,
                            ...merge_fields
                        }
                    }
                };
                
                let createParams = {
                    method: 'POST',
                    headers: getHeaders(),
                    body: JSON.stringify(data)
                };
                
                let profileId;
                const createResponse = await fetch(`https://a.klaviyo.com/api/profiles`, createParams);
                if (createResponse.status === 409) {
                    // Handle race condition - profile was created between our check and create
                    const errorBody = await createResponse.json();
                    profileId = errorBody.errors[0].meta.duplicate_profile_id;
                    
                    data.data.id = profileId;
                    const updateResponse = await fetch(`https://a.klaviyo.com/api/profiles/${profileId}`, {
                        method: 'PATCH',
                        headers: getHeaders(),
                        body: JSON.stringify(data)
                    });
                    
                    if (!updateResponse.ok) {
                        const errorText = await updateResponse.text();
                        console.error('Profile update error response:', errorText);
                        throw new Error(`Failed to update profile: ${errorText}`);
                    }
                } else if (!createResponse.ok) {
                    console.error('Klaviyo profile creation error:', await createResponse.text());
                    throw new Error(`Klaviyo profile creation failed with status ${createResponse.status}`);
                } else {
                    const createBody = await createResponse.json();
                    profileId = createBody.data.id;
                }
                
                // Set subscription status for the profile
                // First get all lists for this profile
                const listsResponse = await fetch(`https://a.klaviyo.com/api/profiles/${profileId}/lists`, {
                    method: 'GET',
                    headers: getHeaders()
                });
                
                if (!listsResponse.ok) {
                    console.error('Failed to get lists:', await listsResponse.text());
                    throw new Error(`Failed to get lists with status ${listsResponse.status}`);
                }
                
                const listsData = await listsResponse.json();
                
                // Update subscription for each list
                const updatePromises = listsData.data.map(list => {
                    let subscriptionData = {
                        data: {
                            type: "profile-subscription",
                            attributes: {
                                custom_source: "Admin Panel",
                                subscribed: newSubscriberStatus === 'subscribed'
                            },
                            relationships: {
                                list: {
                                    data: {
                                        type: "list",
                                        id: list.id
                                    }
                                }
                            }
                        }
                    };
                    
                    return fetch(`https://a.klaviyo.com/api/profiles/${profileId}/subscription-relationships`, {
                        method: 'POST',
                        headers: getHeaders(),
                        body: JSON.stringify(subscriptionData)
                    });
                });
                
                // Wait for all updates to complete
                const results = await Promise.all(updatePromises);
                const bodies = await Promise.all(results.map(async r => {
                    if (!r.ok) {
                        console.error('Subscription update failed:', await r.text());
                        return null;
                    }
                    return r.json();
                }));
                
                resolve(bodies.filter(Boolean));
                if (!updateResponse.ok) {
                    console.error('Klaviyo update error:', await updateResponse.text());
                    throw new Error(`Klaviyo update failed with status ${updateResponse.status}`);
                }
                const updateBody = await updateResponse.json();
                resolve([updateBody]);
            }
        } catch (err) {
            console.error('Error in handleSubscription:', err);
            reject(err);
        }
    });
};

klaviyoService.prototype.updateContact = async function (email, merge_fields, customer_id) {
    return new Promise(async (resolve, reject) => {
        try {
            email = email.toLowerCase();
            let params = {
                method: 'GET',
                headers: getHeaders()
            };
            
            const profileResponse = await fetch(`https://a.klaviyo.com/api/profiles?filter=equals(email,"${encodeURIComponent(email)}")`, params);
            if (!profileResponse.ok) {
                console.error('Klaviyo profile search error:', await profileResponse.text());
                throw new Error(`Klaviyo profile search failed with status ${profileResponse.status}`);
            }
            const profileData = await profileResponse.json();
            
            if (profileData.data && profileData.data.length > 0) {
                const profileId = profileData.data[0].id;
                
                // Update the profile directly
                let data = {
                    data: {
                        type: "profile",
                        id: profileId,
                        attributes: {
                            email: email,
                            ...merge_fields
                        }
                    }
                };
                
                let updateParams = {
                    method: 'PATCH',
                    headers: getHeaders(),
                    body: JSON.stringify(data)
                };
                
                // Try to update the profile
                const updateResponse = await fetch(`https://a.klaviyo.com/api/profiles/${profileId}`, updateParams);
                if (!updateResponse.ok) {
                    const errorText = await updateResponse.text();
                    const errorJson = JSON.parse(errorText);
                    console.error('Klaviyo profile update error:', errorText);
                    
                    // If we get a conflict error, merge the profiles
                    if (updateResponse.status === 409 && errorJson.errors?.[0]?.meta?.duplicate_profile_id) {
                        const duplicateProfileId = errorJson.errors[0].meta.duplicate_profile_id;
                        
                        // Create merge request using the correct endpoint and method
                        const mergeData = {
                            data: {
                                type: "profile-merge",
                                relationships: {
                                    profiles: {
                                        data: [
                                            { type: "profile", id: duplicateProfileId },
                                            { type: "profile", id: profileId }
                                        ]
                                    }
                                }
                            }
                        };
                        
                        const mergeResponse = await fetch('https://a.klaviyo.com/api/profile-merge', {
                            method: 'POST',
                            headers: getHeaders(),
                            body: JSON.stringify(mergeData)
                        });
                        
                        if (!mergeResponse.ok) {
                            throw new Error(`Failed to merge profiles: ${await mergeResponse.text()}`);
                        }
                        
                        
                        // Update the data to use the duplicate profile ID since that's now our primary
                        data.data.id = duplicateProfileId;
                        
                        // Now update the merged profile
                        const retryResponse = await fetch(`https://a.klaviyo.com/api/profiles/${duplicateProfileId}`, {
                            method: 'PATCH',
                            headers: getHeaders(),
                            body: JSON.stringify(data)
                        });
                        
                        if (!retryResponse.ok) {
                            throw new Error(`Failed to update merged profile: ${await retryResponse.text()}`);
                        }
                        
                        const retryBody = await retryResponse.json();
                        resolve([retryBody]);
                    } else {
                        throw new Error(`Klaviyo profile update failed with status ${updateResponse.status}: ${errorText}`);
                    }
                } else {
                    const updateBody = await updateResponse.json();
                    resolve([updateBody]);
                }
            } else {
                // If no profile exists, create a new one
                let data = {
                    data: {
                        type: "profile",
                        attributes: {
                            email: email,
                            ...merge_fields
                        }
                    }
                };
                
                let createParams = {
                    method: 'POST',
                    headers: getHeaders(),
                    body: JSON.stringify(data)
                };
                
                const createResponse = await fetch(`https://a.klaviyo.com/api/profiles`, createParams);
                if (createResponse.status === 409) {
                    // Handle race condition - profile was created between our check and create
                    const errorBody = await createResponse.json();
                    const existingProfileId = errorBody.errors[0].meta.duplicate_profile_id;
                    
                    // Verify this profile is actually for our email
                    const verifyResponse = await fetch(`https://a.klaviyo.com/api/profiles/${existingProfileId}`, {
                        method: 'GET',
                        headers: getHeaders()
                    });
                    
                    if (!verifyResponse.ok) {
                        console.error('Failed to verify profile:', await verifyResponse.text());
                        throw new Error(`Failed to verify profile with status ${verifyResponse.status}`);
                    }
                    
                    const profile = await verifyResponse.json();
                    if (profile.data.attributes.email.toLowerCase() !== email.toLowerCase()) {
                        console.error('Profile ID belongs to different email:', profile.data.attributes.email);
                        throw new Error('Profile ID belongs to different email address');
                    }
                    
                    // Now we can safely update this profile
                    data.data.id = existingProfileId;
                    const updateResponse = await fetch(`https://a.klaviyo.com/api/profiles/${existingProfileId}`, {
                        method: 'PATCH',
                        headers: getHeaders(),
                        body: JSON.stringify(data)
                    });
                    
                    if (!updateResponse.ok) {
                        const errorText = await updateResponse.text();
                        console.error('Profile update error response:', errorText);
                        throw new Error(`Failed to update profile: ${errorText}`);
                    }
                    
                    const updateBody = await updateResponse.json();
                    resolve([updateBody]);
                } else if (!createResponse.ok) {
                    console.error('Klaviyo profile creation error:', await createResponse.text());
                    throw new Error(`Klaviyo profile creation failed with status ${createResponse.status}`);
                } else {
                    const createBody = await createResponse.json();
                    resolve([createBody]);
                }
            }
        } catch (err) {
            console.error('Error in updateContact:', err);
            reject(err);
        }
    });
};

klaviyoService.prototype.transferSubscription = async function (source_email, target_email) {
    return new Promise(async (resolve, reject) => {
        try {
            source_email = source_email.toLowerCase();
            target_email = target_email.toLowerCase();
            
            let params = {
                method: 'GET',
                headers: getHeaders()
            };
            
            const sourceProfileResponse = await fetch(`https://a.klaviyo.com/api/profiles?filter=equals(email,"${encodeURIComponent(source_email)}")`, params);
            if (!sourceProfileResponse.ok) {
                console.error('Klaviyo source profile search error:', await sourceProfileResponse.text());
                throw new Error(`Klaviyo source profile search failed with status ${sourceProfileResponse.status}`);
            }
            const sourceProfileData = await sourceProfileResponse.json();
            
            if (sourceProfileData.data && sourceProfileData.data.length > 0) {
                const sourceProfileId = sourceProfileData.data[0].id;
                
                // Get list memberships from profile relationships
                const listMembershipsResponse = await fetch(sourceProfileData.data[0].relationships.lists.links.self, params);
                if (!listMembershipsResponse.ok) {
                    console.error('Klaviyo list memberships error:', await listMembershipsResponse.text());
                    throw new Error(`Klaviyo list memberships failed with status ${listMembershipsResponse.status}`);
                }
                const listMembershipsData = await listMembershipsResponse.json();

                // Get lists details
                const listsResponse = await fetch(sourceProfileData.data[0].relationships.lists.links.related, params);
                if (!listsResponse.ok) {
                    console.error('Klaviyo lists error:', await listsResponse.text());
                    throw new Error(`Klaviyo lists failed with status ${listsResponse.status}`);
                }
                const listsData = await listsResponse.json();

                // Create new profile with source profile's data
                // Create new profile with only valid fields
                let newProfileData = {
                    data: {
                        type: "profile",
                        attributes: {
                            email: target_email,
                            first_name: sourceProfileData.data[0].attributes.first_name,
                            last_name: sourceProfileData.data[0].attributes.last_name,
                            phone_number: sourceProfileData.data[0].attributes.phone_number,
                            organization: sourceProfileData.data[0].attributes.organization,
                            title: sourceProfileData.data[0].attributes.title,
                            image: sourceProfileData.data[0].attributes.image,
                            location: sourceProfileData.data[0].attributes.location,
                            properties: sourceProfileData.data[0].attributes.properties
                        }
                    }
                };
                
                let createParams = {
                    method: 'POST',
                    headers: getHeaders(),
                    body: JSON.stringify(newProfileData)
                };
                
                const createResponse = await fetch(`https://a.klaviyo.com/api/profiles`, createParams);
                if (!createResponse.ok) {
                    console.error('Klaviyo profile creation error:', await createResponse.text());
                    throw new Error(`Klaviyo profile creation failed with status ${createResponse.status}`);
                }
                
                const createBody = await createResponse.json();
                const newProfileId = createBody.data.id;
                
                // Transfer subscriptions for each list
                const updatePromises = listsData.data.map(list => {
                    // Check if the list ID exists in the memberships data
                    const isMember = listMembershipsData.data?.some(membership => membership.id === list.id);
                    if (!isMember) return Promise.resolve(); // Skip if not a member

                    let subscriptionData = {
                        data: {
                            type: "profile-subscription",
                            attributes: {
                                custom_source: "Admin Panel",
                                subscribed: true
                            },
                            relationships: {
                                list: {
                                    data: {
                                        type: "list",
                                        id: list.id
                                    }
                                }
                            }
                        }
                    };
                    
                    let subscriptionParams = {
                        method: 'POST',
                        headers: getHeaders(),
                        body: JSON.stringify(subscriptionData)
                    };
                    
                    return fetch(`https://a.klaviyo.com/api/profiles/${newProfileId}/subscription-relationships`, subscriptionParams);
                }).filter(Boolean); // Remove any undefined promises
                
                // Wait for all transfers to complete
                const results = await Promise.all(updatePromises);
                const bodies = await Promise.all(results.map(r => r.json()));
                
                resolve(bodies);
            } else {
                resolve(null);
            }
        } catch (err) {
            console.error('Error in transferSubscription:', err);
            reject(err);
        }
    });
};

klaviyoService.prototype.addToStore = async function (email, data) {
    return new Promise(async (resolve, reject) => {
        try {
            email = email.toLowerCase();
            
            let profileData = {
                data: {
                    type: "profile",
                    attributes: {
                        email: email,
                        first_name: data.first_name,
                        last_name: data.last_name,
                        phone_number: data.address.phone,
                        location: {
                            city: data.address.city,
                            zip: data.address.postal_code,
                            country: data.address.country_code
                        }
                    }
                }
            };
            
            try {
                // Try to create profile first
                const createResponse = await fetch('https://a.klaviyo.com/api/profiles', {
                    method: 'POST',
                    headers: getHeaders(),
                    body: JSON.stringify(profileData)
                });

                // If we get a 409 (conflict), it means the profile exists
                if (createResponse.status === 409) {
                    const errorBody = await createResponse.json();
                    const existingProfileId = errorBody.errors[0].meta.duplicate_profile_id;

                    // Update the existing profile
                    profileData.data.id = existingProfileId;
                    const updateResponse = await fetch(`https://a.klaviyo.com/api/profiles/${existingProfileId}`, {
                        method: 'PATCH',
                        headers: getHeaders(),
                        body: JSON.stringify(profileData)
                    });

                    if (!updateResponse.ok) {
                        throw new Error(`Failed to update profile: ${await updateResponse.text()}`);
                    }

                    var body = await updateResponse.json();
                } else if (!createResponse.ok) {
                    throw new Error(`Failed to create profile: ${await createResponse.text()}`);
                } else {
                    var body = await createResponse.json();
                }
            } catch (err) {
                if (err.message.includes('duplicate_profile')) {
                    // If we somehow missed catching the 409 above, try one more time to update
                    const profileResponse = await fetch(`https://a.klaviyo.com/api/profiles?filter=equals(email,"${encodeURIComponent(email)}")`, {
                        method: 'GET',
                        headers: getHeaders()
                    });
                    const profileResult = await profileResponse.json();
                    
                    if (profileResult.data && profileResult.data.length > 0) {
                        const profileId = profileResult.data[0].id;
                        profileData.data.id = profileId;
                        const updateResponse = await fetch(`https://a.klaviyo.com/api/profiles/${profileId}`, {
                            method: 'PATCH',
                            headers: getHeaders(),
                            body: JSON.stringify(profileData)
                        });
                        
                        if (!updateResponse.ok) {
                            throw new Error(`Failed to update profile: ${await updateResponse.text()}`);
                        }
                        
                        var body = await updateResponse.json();
                    } else {
                        throw err;
                    }
                } else {
                    throw err;
                }
            }
            
            resolve(body);
        } catch (err) {
            console.error('Error in addToStore:', err);
            reject(err);
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
                    const quantity = t.quantity ? parseFloat(t.quantity) : 0;
                    const price = t.price ? parseFloat(t.price) : 0;
                    return {
                        ProductID: t.id || '',
                        ProductName: t.name || '',
                        Quantity: quantity,
                        ItemPrice: price,
                        RowTotal: Number((quantity * price).toFixed(2)),
                        ImageURL: t.display_image && t.display_image.link ? t.display_image.link : '',
                        Categories: t.category || '',
                        Brand: "E-commerce"
                    }
                }).filter(item => item.ProductName); // Only include items with a name
                
                itemsNames = items.map(item => item.ProductName).filter(Boolean);
            }

            const properties = {
                event_id: orderData.order_id2,
                value: Number(parseFloat(orderData.total || 0).toFixed(2)),
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
                const response = await fetch(`https://a.klaviyo.com/api/events`, {
                    method: 'POST',
                    headers: getHeaders(),
                    body: JSON.stringify(eventData)
                });
                
                const responseText = await response.text();
                
                if (!response.ok) {
                    console.error('Event tracking error response:', responseText);
                    throw new Error(`Failed to track order event: ${responseText}`);
                }
                
                const responseBody = responseText ? JSON.parse(responseText) : null;
                resolve(responseBody);
            } catch (err) {
                if (err.type === 'invalid-json') {
                    console.error('Invalid JSON response from Klaviyo API');
                    resolve(null); // Resolve with null since the event was likely tracked despite the invalid response
                } else {
                    throw err;
                }
            }
        } catch (err) {
            console.error('Error in fulfilledOrder:', err);
            return reject(err);
        }
    });
};

module.exports = new klaviyoService();
