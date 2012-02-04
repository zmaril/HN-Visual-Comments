from HTMLParser import HTMLParser
import urllib
import time

user= "pg"
links=["/threads?id="+user]
newsyc= 'http://news.ycombinator.com'

class MyHTMLParser(HTMLParser):
    def handle_starttag(self, tag, attrs):
        dictAttrs = dict(attrs)
        if tag=="a":
            href = dictAttrs['href']
            if href[0:7]=="/x?fnid":
                print href
                links.append(href)

def run():
    last = ""
    while len(links)<50 and last != links[-1]: 
        last = links[-1]
        time.sleep(5)
        nextLink = newsyc+links[-1]
        response = urllib.urlopen(nextLink)
        print nextLink
        html = response.read()        
        parser = MyHTMLParser()
        parser.feed(html)
        pageFile = open(user+"/page"+str(len(links)-1),'w')
        pageFile.write(html)
        pageFile.close()

    
