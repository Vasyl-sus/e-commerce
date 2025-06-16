import sys
import scipy
import numpy
import matplotlib
import sklearn
import os.path
import json

import pandas
from pandas.plotting import scatter_matrix
import matplotlib.pyplot as plt
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


my_path = os.path.abspath(os.path.dirname(__file__))
path = os.path.join(my_path, "./files/pythonData.csv")

dataset = pandas.read_csv(path)

array = dataset.values
X = array[:,0:9]
Y = array[:,9]


validation_size = 0.25
seed = 1
scoring = 'accuracy'
X_train, X_validation, Y_train, Y_validation = model_selection.train_test_split(X, Y, test_size=validation_size, random_state=seed)

scaling = MinMaxScaler(feature_range=(0,1)).fit(X_train)
X_train = scaling.transform(X_train)
X_validation = scaling.transform(X_validation)

models = []
models.append(('LR', LogisticRegression()))
models.append(('LDA', LinearDiscriminantAnalysis()))
models.append(('KNN', KNeighborsClassifier()))
models.append(('CART', DecisionTreeClassifier()))
models.append(('NB', GaussianNB()))
#models.append(('SVM', SVC()))

results = []
names = []
scores = []
for name, model in models:
    kfold = model_selection.KFold(n_splits=10, random_state=seed)
    cv_results = model_selection.cross_val_score(model, X_train, Y_train, cv=kfold, scoring=scoring)
    results.append(cv_results)
    names.append(name)
    scores.append(float(cv_results.mean()))

finalModelIdx = scores.index(max(scores))
name = names[finalModelIdx]
score = scores[finalModelIdx]
print(name)
print(score)

finalModel = models[finalModelIdx][1]
finalModel.fit(X_train, Y_train)
predictions = finalModel.predict(X_validation)
path1 = os.path.join(my_path, "./files/current_model.sav")
joblib.dump(finalModel, path1)
#print(dataset.groupby('rep_buyer').size())
#print(accuracy_score(Y_validation, predictions))
#print(confusion_matrix(Y_validation, predictions))
#print(classification_report(Y_validation, predictions))