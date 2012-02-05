from HTMLParser import HTMLParser
import urllib
import time

#patio11
#cwan
#fogus
#cwan
#jrockway
#swombat
#ssclafani
#raganwald
user= "jacquesm"
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
    while len(links)<30 and last != links[-1]: 
        last = links[-1]
        print len(links)
        time.sleep(30)
        nextLink = newsyc+links[-1]
        response = urllib.urlopen(nextLink)
        print nextLink
        html = response.read()        
        parser = MyHTMLParser()
        parser.feed(html)
        pageFile = open("rawpages/"+user+"/page"+str(len(links)-1),'w')
        pageFile.write(html)
        pageFile.close()


    
