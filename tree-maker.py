from HTMLParser import HTMLParser
import re
import copy
import json
# "<table border=0><tr>.+ height=1 width=(\d+)></td>.+<a href=\"user.id=(\w+).+ago  | <a href=\"(.+)\">link.+\n<span class=\"comment\"><font color=#[0-9a-zA-Z]+>(.+)</font></span>"
def stripPage(page):
    regExp = "<table border=0><tr>.+ height=1 width=(\d+)></td>.+<a href=\"user.id=(\w+).+ago  \| <a href=\"(.+)\">link.+\n<span class=\"comment\"><font color=#[0-9a-zA-Z]+>(.+)</font></span>"
    m = re.findall(regExp,page)
    levels = map(lambda (strNum,name,link,comment): (int(strNum)/40,name,{'link': link, 'comment': comment, 'user': name}),m)
    return levels

def levelToTree(level,base):
    node = {'names': [level[0][1]],
            'comments': [level[0][2]],
            'children': levelsToTree(level[1:],base+1)}
    return node

def levelsToTree(levels,base):
    commentTrees = []
    if len(levels)==0:
        return
    current = [levels[0]]
    for piece in levels[1:]:
        if piece[0] != base:
            current.append(piece)
        else:            
            commentTrees.append(levelToTree(current,base))
            current = [piece]
    commentTrees.append(levelToTree(current,base))
    return commentTrees

def combineTrees(oldTreeA,oldTreeB):
    treeA = copy.deepcopy(oldTreeA)
    treeB = copy.deepcopy(oldTreeB)
    if treeA == None:
        return treeB
    elif treeB == None:
        return treeA
    elif treeA['children'] == None:
        treeB['names'].extend(treeA['names'])
        treeB['comments'].extend(treeA['comments'])
        return treeB
    elif treeB['children'] == None:
        treeA['names'].extend(treeB['names'])
        treeA['comments'].extend(treeB['comments'])
        return treeA
    else:
        names = treeA['names']
        names.extend(treeB['names'])
        childrenA= treeA['children']
        childrenB= treeB['children']

        if len(childrenA)>len(childrenB):
            diff = len(childrenA)-len(childrenB)
            filler = map(lambda x: None, range(diff))
            childrenB.extend(filler)

        elif len(childrenB)>len(childrenA):
            diff = len(childrenB)-len(childrenA)
            filler = map(lambda x: None, range(diff))
            childrenA.extend(filler)
    
        children = map( lambda i: combineTrees(childrenA[i],childrenB[i])
                        ,range(len(childrenA)))
        newComments = treeA['comments']
        newComments.extend(treeB['comments'])
        newTree = { 'names': names,
                    'children': children,
                    'comments': newComments}
        return newTree

def mode(list):
    cat= {}
    for item in list:
        if item in cat:
            cat[item] += 1
        else:
            cat[item]=1
    topItem= None
    topRank= -1
    items = cat.items()
    for item in items:
        if item[1] > topRank:
            (topItem, topRank)= item
    return topItem
        
def averageTree(tree):
    tree['number']=len(tree['names'])
    tree['names']=mode(tree['names'])
    if tree['children']:
        map(averageTree,tree['children'])

users=["edw519","jacquesm","patio11","pg","tptacek"]

def process():
    allTogether = {}
    for user in users:
        print user
        files = os.listdir(os.getcwd()+"/rawpages/"+user)
        trees=[]
        for file in files:
            print file
            page = open("rawpages/"+user+"/"+file).read()
            trees.extend(levelsToTree(stripPage(page),0))
            onlySoMany= trees[0:100]
            overlayTree = reduce(combineTrees,onlySoMany)
            averageTree(overlayTree)
        allTogether[user]=overlayTree
    return allTogether

m=process()

temp = open("users.json","w")
temp.write(json.dumps(m))
temp.close()
print "Done"       
      


