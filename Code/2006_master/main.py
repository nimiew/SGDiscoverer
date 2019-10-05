import os
import json
import random
import sqlite3
import urllib
import pprint

from flask import Flask
from flask import request, jsonify, render_template, send_from_directory, redirect
from flask import session
from flask_pymongo import PyMongo
import requests

from utils import search_places_by_coordinate, get_sort_dist_indices, get_obj
from utils import addItemToString, removeItemFromString
from imagelinknew import imagescrape

app = Flask(__name__)
app.config['MONGO_DBNAME'] = "db"
uri = urllib.parse.quote('1qA!2wS@3eD')
app.config['MONGO_URI'] = 'mongodb+srv://yakultbinz:'+uri+'#@sgdiscoverer-dszci.mongodb.net/test?retryWrites=true'
mongo = PyMongo(app)
GMAPKEY = 'AIzaSyAnYUGEUsblkkctQdldpMm7KSG5lX0i1M8'

all_districts = ['Admiralty', 'Alexandra Road', 'Ang Mo Kio', 'Anson', 'Balestier', 'Balmoral', 'Bayshore', 'Beach Road', 'Bedok', 'Bencoolen Road', 'Bishan', 'Boat Quay', 'Boon Lay', 'Boulevard', 'Braddell Road', 'Bugis', 'Bukit Batok', 'Bukit Timah', 'Buona Vista', 'Cairnhill', 'Chai Chee', 'Chancery', 'Changi', 'Chinatown', 'Choa Chu Kang', 'City Hall', 'Clementi', 'Dover', 'Dunearn Road', 'Eunos', 'Farrer Park', 'Geylang', 'Grange Road', 'Havelock Road', 'High Street', 'Hillview Avenue', 'Holland Road', 'Hougang', 'Hume Avenue', 'Jurong', 'Katong', 'Kembangan', 'Keppel', 'Killiney', 'Kranji', 'Leonie Hill', 'Lim Chu Kang', 'Little India', 'Loyang', 'Macpherson', 'Marina Square', 'Marine Parade', 'Moulmein', 'Mount Faber', 'Neil Road', 'Newton', 'North Bridge Road', 'Novena', 'Orchard', 'Oxley', 'Pasir Panjang', 'Pasir Ris', 'Paya Lebar', 'Potong Pasir', 'Punggol', 'Queenstown', 'Raffles Place', 'River Valley', 'Rochor', 'Seletar', 'Sembawang', 'Sengkang', 'Sentosa', 'Serangoon Road', 'Shenton Way', 'Siglap', 'Simei', 'Sungei Gedong', 'Suntec City', 'Tagore', 'Tampines', 'Tanglin Road', 'Tanjong Pagar', 'Tanjong Rhu', 'Telok Blangah', 'Tengah', 'Thomson', 'Tiong Bahru', 'Toa Payoh', 'Tuas', 'Upper Bukit Timah', 'West Coast', 'Woodlands', 'Yio Chu Kang', 'Yishun']

@app.route('/', methods=['GET'])
def home():
    url = "https://maps.googleapis.com/maps/api/js?key={}&callback=initMap".format(GMAPKEY)
    return render_template('map.html', gmapsurl=url, all_districts=all_districts)

@app.route('/putPic', methods=['GET'])
def put_Pic():
    pointName = request.args.get('pointname')
    result = imagescrape(pointName)
    response = jsonify(results=result)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/list', methods=['GET'])
def deal_list():
    return render_template('deals.html')


@app.route('/scripts/<path:path>')
def send_js(path):
    return send_from_directory('templates/scripts', path)


@app.route('/styles/<path:path>')
def send_css(path):
    return send_from_directory('templates/styles', path)

@app.route('/getfavourites', methods=['GET'])
def getfavourites():
    objs = []
    username = request.args.get('username')
    users = mongo.db.users
    existing_user = users.find_one({'name': username})
    if existing_user is None:
        print("this is not possible. u dead")
        print("debug1")
        return ('', 204)
    if(existing_user['favourites']==''):
        print("debug2")
        favourites = []
    else:
        print("debug3")
        favourites = existing_user['favourites'].split(',') #each fav is a place_id
        for i in favourites:
            objs.append(get_obj(i)) #get_obj returns obj corresponding to the place_id
        response = jsonify(objs)
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response


@app.route('/getdeals', methods=['GET'])
def getdeals():
    conn = sqlite3.connect('deals.db', detect_types=sqlite3.PARSE_DECLTYPES | sqlite3.PARSE_COLNAMES)
    cur = conn.execute('SELECT * FROM DEALS')
    rows = cur.fetchall()
    output = []
    for row in rows:
        addresses = None
        days = None
        if row[2] is not None:
            addresses = json.loads(row[2])
        if row[5] is not None:
            days = json.loads(row[5])
        output.append({"name": row[0],
                       "enddate": row[1],
                       "address_txt": row[3],
                       "address_url": row[4],
                       "addresses": addresses,
                       "days": days,
                       "timing": row[7],
                       "timeinfo": row[8],
                       "latlongs": json.loads(row[9])})
    response = jsonify(output)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/getdist', methods=['POST'])
def getdist():
    data = request.get_json()
    address = data['address']
    mode = data['mode']
    coords_list = data['latlon_list']
    result = get_sort_dist_indices(address, mode, coords_list)
    response = jsonify(results=result)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/viewport', methods=['GET'])
def viewport():
    searchTerm = request.args.get('search')
    minrating = request.args.get('minrating')
    maxdist = request.args.get('maxdist')
    type = request.args.get('type')

    if minrating is not None:
        minrating = int(minrating)
    else:
        minrating = 0

    if (searchTerm == 'nil'):
        lat = request.args.get('userlat')
        lng = request.args.get('userlng')

        url = 'https://maps.googleapis.com/maps/api/geocode/json?address={}&region=sg&key={}'.format(str(lat) + "," + str(lng), GMAPKEY)

        r = requests.get(url)
        result = r.json()['results'][0]['geometry']['viewport']
    else:
        url = 'https://maps.googleapis.com/maps/api/geocode/json?address={}&region=sg&key={}'.format(searchTerm, GMAPKEY)

        r = requests.get(url)
        result = r.json()['results'][0]['geometry']['viewport']
        lat = str(r.json()['results'][0]['geometry']['location']['lat'])
        lng = str(r.json()['results'][0]['geometry']['location']['lng'])

    result['nearby'] = search_places_by_coordinate(lat + "," + lng, maxdist, minrating, type)
    if (result['nearby'] != []):
        chosen = random.choice(result['nearby'])
        result['chosen'] = chosen

    response = jsonify(results=result)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/register', methods=['POST', 'GET'])
def register():
    print("Session before register:", session)
    if request.method == 'POST':
        users = mongo.db.users
        existing_user = users.find_one({'name': request.form['username']})
        if existing_user is None:
            #hashpass = bcrypt.hashpw(request.form['password'].encode('utf-8'), bcrypt.gensalt())
            food_preference = ','.join(request.form.getlist('food'))
            print(food_preference)
            users.insert({'name': request.form['username'], 'password': request.form['password'],
                          'food_preference': food_preference, 'favourites': ''})
            session['username'] = request.form['username']
            session['status'] = 'connected'
            session['food_preference']=food_preference
            session['favourites'] = ''
            username = session['username']
            print("Session after register:", session)
            url = "https://maps.googleapis.com/maps/api/js?key={}&callback=initMap".format(GMAPKEY)
            return render_template('map.html', username=username, session=session, gmapsurl=url, all_districts=all_districts)
        return 'That username already exists'
    return render_template('register.html')


@app.route('/login', methods=['POST','GET'])
def login():
    print("Session before login:", session)
    if(request.method == 'POST'):
        users = mongo.db.users
        login_user = users.find_one({'name': request.form['username']})

        if login_user:
            #if bcrypt.hashpw(request.form['password'].encode('utf-8'),login_user['password'].encode('utf-8'))==login_user['password'].encode('utf-8'):
            if request.form['password'] == login_user['password']:
                session['username']=request.form['username']
                session['status']='connected'
                session['food_preference']=login_user['food_preference']
                session['favourites']=login_user['favourites']
                username = session['username']
                print("Session after login:", session)
                url = "https://maps.googleapis.com/maps/api/js?key={}&callback=initMap".format(GMAPKEY)
                return render_template('map.html', username=username, session=session, gmapsurl=url, all_districts=all_districts)
        return "Invalid Username And Password"
    return render_template('login.html')

@app.route('/logout', methods=['GET'])
def logout():
    session['username']=""
    session['status']="disconnected"
    session['food_preference']=""
    session['favourites']=""
    print("Session after logout:", session)
    url = "https://maps.googleapis.com/maps/api/js?key={}&callback=initMap".format(GMAPKEY)
    return render_template('map.html', session=session, gmapsurl=url, all_districts=all_districts)

@app.route('/storefavourite', methods=['GET'])
def storefavourite():
    place_id = request.args.get('id')
    #print("place_id:", place_id)
    favourite = request.args.get('favourite')
    #print("favourite:", favourite)
    username = request.args.get('username')
    #print("username:", username)
    users = mongo.db.users
    existing_user = users.find_one({'name': username})
    if existing_user is None:
        print("this is not possible. u dead")
        return ('', 204)
    if(favourite=='Y'):
        existing_user['favourites'] = addItemToString(existing_user['favourites'], place_id)
        session['favourites'] = addItemToString(session['favourites'], place_id)
        print(session['favourites'])
        users.delete_one({'name': username})
        users.insert_one(existing_user)
    elif(favourite=='N'):
        try:
            existing_user['favourites'] = removeItemFromString(existing_user['favourites'], place_id)
            session['favourites'] = removeItemFromString(session['favourites'], place_id)
        except:
            print("Error")
        users.delete_one({'name': username})
        users.insert_one(existing_user)
    return ('', 204)
