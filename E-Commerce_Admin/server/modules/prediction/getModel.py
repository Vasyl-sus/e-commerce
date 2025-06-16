import sys
import numpy
import sklearn
import os.path
import json

import pandas
from sklearn import model_selection
from sklearn.metrics import classification_report
from sklearn.metrics import confusion_matrix
from sklearn.metrics import accuracy_score
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.tree import DecisionTreeRegressor
from sklearn.neighbors import KNeighborsClassifier
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis
from sklearn.naive_bayes import GaussianNB
from sklearn.svm import SVC
from sklearn.preprocessing import MinMaxScaler
from sklearn.externals import joblib

dataset = json.loads(sys.argv[1])

data = []
ids = []
for elt in dataset:
    values = list(elt.values())
    customer_id = values[-1]
    del values[-1]
    data.append(values)
    ids.append(customer_id)

X1 = numpy.array(data)

my_path = os.path.abspath(os.path.dirname(__file__))
path = os.path.join(my_path, "./files/current_model.sav")

loaded_model = joblib.load(path)

predictions = loaded_model.predict(X1)
result = predictions.tolist()

obj = {}
for customer_id, p in zip(ids, result):
    obj[customer_id] = p

string = json.dumps(obj)
print(string)
