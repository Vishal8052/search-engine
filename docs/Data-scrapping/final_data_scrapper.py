#import all the libraries
import re
import time
import os
from selenium import webdriver
from bs4 import BeautifulSoup
from webdriver_manager.chrome import ChromeDriverManager
import lxml.html
import lxml.html.clean


def cleanHTML(html):
    doc = lxml.html.fromstring(html)
    cleaner = lxml.html.clean.Cleaner(style=True)
    doc = cleaner.clean_html(doc)
    s = doc.text_content()
    u = ""
    for c in s:
        if ord(c) < 128:
            u += c
        else:
            u += " "

    return u


driver = webdriver.Chrome(ChromeDriverManager().install())


# get the url
my_url = "https://leetcode.com/problemset/all/?page="
copyurl = my_url
mypath = r"C:\Users\Vishal Kumar Mishra\Desktop\docs"
copypath = mypath

links_to_problems=[]
titles=[]

cnt=1

for i in range(1,47,1):
    my_url = copyurl
    my_url+=str(i)
    driver.get(my_url)
    time.sleep(10)
    main_page_html = driver.page_source
    page_soup = BeautifulSoup(main_page_html, 'html.parser')
    if(page_soup.find("div", {"class", "dark:text-dark-brand-orange h-[18px] w-[18px] text-brand-orange"})):
      continue
    mydivs = page_soup.find_all("a", {"class": "h-5 hover:text-primary-s dark:hover:text-dark-primary-s"},href=True)

    #Get the problem links
    for div in mydivs:
        links_to_problems.append("https://leetcode.com"+div['href'])


mypath = copypath
mypath += "\links.txt"
with open(mypath, "w") as f:
      for link in links_to_problems:
           f.write(link)
           f.write('\n')
      f.close()



#Get the problems
for problem_link in links_to_problems:
    mypath = copypath
    driver.get(problem_link)
    time.sleep(10)
    problem_page_html = driver.page_source
    problem_page_soup = BeautifulSoup(problem_page_html, 'html.parser')
    # if(problem_page_soup.find("div", {"class", "css-v3d350"}) == None):
    #   continue
    for tag in problem_page_soup.find_all('sup'):
        tag.insert(0, "^")

    problem_div = problem_page_soup.find("div", {"class", "content__u3I1 question-content__JfgR"})
    problem_title = problem_page_soup.find("div", {"class", "css-v3d350"}).text
    titles.append(problem_title)
    problem_text = problem_div.encode("utf-8")
    mypath += "\\probs\\"
    mypath += str(cnt)+".txt"
    with open(mypath, "w") as f:
        f.write(cleanHTML(problem_text))
    f.close()
    cnt+=1

mypath = copypath
mypath+="\titles.txt"
with open(mypath, "w") as f:
        for title in titles:
            f.write(title)
            f.write('\n')
        f.close()


