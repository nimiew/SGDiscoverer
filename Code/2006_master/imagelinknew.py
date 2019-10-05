# street directory else yahoo
def imagescrape(option):
    '''
    input: string
    output: string
    desc: takes in name of place and return picture url of that place
    '''
    import urllib.request
    import urllib.parse
    from bs4 import BeautifulSoup

    option = option.lower()
    option = urllib.parse.quote(option)
    url = "https://www.streetdirectory.com/asia_travel/search/?q="+option+ "&country=singapore&state=0" # for input url direct
    html = urllib.request.urlopen(url).read()
    soup = BeautifulSoup(html,'html.parser')

    # kill all script and style elements
    for oscript in soup(["script", "style"]):
        oscript.extract()    # rip it out
    # check if no result found
    validplace = soup.find_all("td", class_= "Link22 ver_12 TextBold")
    if validplace == []:
        #check if need search result or direct
        check = soup.find_all("a", class_= "item_title_search")
        if len(check) != 0:
            url = str(check).split("return false")[0].split('" onclick="recordOutboundLink_search')[0].split('<a class="item_title_search" href="')[-1]
            html = urllib.request.urlopen(url).read()
            soup = BeautifulSoup(html,'html.parser')

            # kill all script and style elements
            for script in soup(["script", "style"]):
                script.extract()    # rip it out

        soup = soup.find_all("a", class_= "lhs_menu_location")
        newurl = str(soup[1]).split('href="')[1].split('" id="')[0]
        if 'onclick="' in newurl:
            # summary from url
            yurl = "https://sg.images.search.yahoo.com/search/images?&p=" + option # for input url direct
            yhtml = urllib.request.urlopen(yurl).read()
            ysoup = BeautifulSoup(yhtml,'html.parser')

            # kill all script and style elements
            for yscript in ysoup(["script", "style"]):
                yscript.extract()    # rip it out

            ysoup = ysoup.find_all("li", class_= "ld")

            # return first search result
            text=(str(ysoup[0]).split('"iurl":"'))
            text=text[1].split('","ith"')
            text=text[0]
            text=text.replace("\\","")
            return(text)

        else:
            #process new page
            newhtml = urllib.request.urlopen(newurl).read()
            newsoup = BeautifulSoup(newhtml,'html.parser')
            # kill all script and style elements
            for newscript in newsoup(["script", "style"]):
                newscript.extract()    # rip it out

            # pic link
            comdetails = newsoup.find_all(id="left_big_image")
            if comdetails != []:
                comdetails = str(comdetails).split("background-image: url('")[1].split("');")[0]
                return(comdetails)
            else:
                comdetails = newsoup.find_all(id="company_about_us_content")
                if comdetails != [] and ('span style' in str(comdetails)):
                    comdetails = str(comdetails).split('src="')[1].split('" style=')[0]
                    return(comdetails)
                else:
                    # summary from url
                    option = option.replace('pte.%20ltd.','')
                    yurl = "https://sg.images.search.yahoo.com/search/images?&p=" + option # for input url direct
                    yhtml = urllib.request.urlopen(yurl).read()
                    ysoup = BeautifulSoup(yhtml,'html.parser')

                    # kill all script and style elements
                    for yscript in ysoup(["script", "style"]):
                        yscript.extract()    # rip it out

                    ysoup = ysoup.find_all("li", class_= "ld")

                    # return first search result
                    text=(str(ysoup[0]).split('"iurl":"'))
                    text=text[1].split('","ith"')
                    text=text[0]
                    text=text.replace("\\","")
                    return(text)
    else:
        # summary from url
        option = option.replace('pte.%20ltd.','')
        yurl = "https://sg.images.search.yahoo.com/search/images?&p=" + option # for input url direct
        yhtml = urllib.request.urlopen(yurl).read()
        ysoup = BeautifulSoup(yhtml,'html.parser')

        # kill all script and style elements
        for yscript in ysoup(["script", "style"]):
            yscript.extract()    # rip it out

        ysoup = ysoup.find_all("li", class_= "ld")

        # return first search result
        text=(str(ysoup[0]).split('"iurl":"'))
        text=text[1].split('","ith"')
        text=text[0]
        text=text.replace("\\","")
        return(text)
