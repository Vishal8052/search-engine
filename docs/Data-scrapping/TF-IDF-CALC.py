from copy import copy
import nltk
import re
import math
import numpy as np


# Get the stopwords
from nltk.corpus import stopwords
nltk.download('stopwords')
stopwrds = stopwords.words('english')
# stopwrds.append('Any')
# stopwrds.append('?')
# stopwrds.append('¶')
# stopwrds.append('\n')

# stopwrds.extend(("<", "1", "(", ")", "2", "3", "4", "5", "6", "7", "8", "9", "0","()", "[", "]", "[]", "[", "]", "{}", "{", "}", ".", ",", "'", '"', "_", ":", "-", "NaN","=",">",":","?"))
# # print(stopwrds)

# For storing TF values: Row->document, col->Word
tf_matrix = []
idf_row = []

# For calculating TF-IDF
all_keywords = []
keywords_per_doc = []
mypath = r"C:\Users\Vishal Kumar Mishra\Desktop\Piyush Kumar\Search-Engine-Test-main\docs"
copypath = mypath




for i in range(1, 601):
    # Read the text file
    mypath = copypath
    mypath += "\\probs\\"+ str(i)+".txt"
    file_content = open(mypath).read()
    # Remove the symbols and digits
    file_content = re.sub(r'[^\w]', ' ', file_content)
    file_content = re.sub(" \d+", " ", file_content)
    # print(file_content)
    tokens = file_content.split()
    # print(tokens)

    # Remove the stopwords and get the keywords
    keywords = []

    for word in tokens:
        if word not in stopwrds and word not in keywords:
            keywords.append(word)
            if(word not in all_keywords):
                all_keywords.append(word)

    keywords_per_doc.append(keywords)


# Get the TF matrix
for doc in keywords_per_doc:
    row_matrix = []
    cnt = 0
    for keyword in all_keywords:
        cnt = doc.count(keyword)
        row_matrix.append(cnt/len(doc))
    tf_matrix.append(row_matrix)


# print("hi")
# print(tf_matrix)


for keyword in all_keywords:
    cnt = 0
    for i in range(0, len(keywords_per_doc)):
        if(keyword in keywords_per_doc[i]):
            cnt += 1

    idf_row.append(math.log(len(keywords_per_doc)/cnt, 10))


#Write the IDF value in txt file

mypath = copypath
mypath += "\\IDF-MATRIX.txt"
with open(mypath, 'w') as f:
    for val in idf_row:
         f.write(str(val))
         f.write('\n')
    f.close()

# print(idf_row)
# print(tf_matrix)

mypath = copypath
mypath += "\\All_Keywords.txt"


#Write all keywords in txt file

with open(mypath, 'w') as f:
    for val in all_keywords:
         f.write(str(val))
         f.write('\n')
    f.close()


#calculate tf-idf
tf_idf = []

for tf_row in tf_matrix:
    tf_idf.append(np.array(tf_row)*np.array(idf_row))



mypath = copypath
mypath += "\\tf-idf-data-set.txt"
with open(mypath, 'w') as f:
    for row in tf_idf:
        for col in row:
         f.write(str(col)+" ")
        f.write('\n')
    f.close()



# i = 1
# for row in tf_matrix:
#     # tf_idf_lines = ''.join(str(row))
#     mypath = copypath
#     mypath += "\\TF-IDF\\"+str(i)+".txt"
#     i += 1
#     with open(mypath, 'w') as f:
#         for val in row:
#          f.write(str(val))
#          f.write('\n')
#     f.close()

# print(len(idf_row))
# print(len(tf_idf[15]))
