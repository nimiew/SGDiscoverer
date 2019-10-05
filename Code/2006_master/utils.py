import json
import os
import urllib.parse
import threading
import requests
import time
import pprint

GMAPKEY = # YOUR_GMAP_KEY

def get_photo_url(photo_reference):
    """
    input: string
    output: string
    desc: from placeid to photo url
    """
    photo_reference = urllib.parse.quote(photo_reference)
    url = "https://maps.googleapis.com/maps/api/place/photo?photo_reference={}&key={}".format(photo_reference,GMAPKEY)
    r = requests.get(url)
    return r.url

def getLatLng(address):
    """
    input: string
    output: string
    desc: return lat long of an address
    """
    address = urllib.parse.quote(address)
    url = 'https://maps.googleapis.com/maps/api/geocode/json?address={}&region=sg&key={}'.format(address,GMAPKEY)
    r = requests.get(url)
    return r.json()['results'][0]['geometry']['location']

def get_address_and_place_id(latlng):
    """
    input: string
    output: string
    desc: lat long to address and place id
    """
    latlng = urllib.parse.quote(latlng)
    url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng={}&region=sg&key={}'.format(latlng,GMAPKEY)
    r = requests.get(url)
    address = r.json()['results'][0]['formatted_address']
    place_id = r.json()['results'][0]['place_id']
    return {"address": address, "place_id": place_id}

def get_address(place_id): #NOT USEFUL
    """
    input: string
    output: string
    desc: from placeid to address of place
    """
    place_id = urllib.parse.quote(place_id)
    url = 'https://maps.googleapis.com/maps/api/place/details/json?placeid={}&region=sg&key={}'.format(place_id,GMAPKEY)
    r = requests.get(url)
    address = r.json()['result']['formatted_address']
    return address

def get_obj(place_id):
    """
    input: string
    output: json object
    desc: using placeid get whole json object of place id details
    """
    place_id = urllib.parse.quote(place_id)
    url = 'https://maps.googleapis.com/maps/api/place/details/json?placeid={}&region=sg&key={}'.format(place_id,GMAPKEY)
    r = requests.get(url)
    obj = r.json()
    return obj

def get_distance(start_address, mode, dest_coords, json_obj): #get 1 distance
    """
    input: 3 strings, 1 json_obj
    output: json_obj appended distance
    desc: calculate distance between two addresses depending on mode of transport
    """
    origins = urllib.parse.quote(start_address)
    destinations = urllib.parse.quote(dest_coords)
    mode = urllib.parse.quote(mode)
    url = 'https://maps.googleapis.com/maps/api/distancematrix/json?origins={}&destinations={}&mode={}&region=sg&key={}'.format(start_address,dest_coords, mode, GMAPKEY)
    print(url)
    r = requests.get(url)
    distance = r.json()['rows'][0]['elements'][0]["distance"]["value"] #in meters
    json_obj.append({"distance": str(distance)})

def search_type(location, radius, cat, json_obj, lock, min_rating=0):
    """
    input: 3/4 strings, 1 json_obj
    output: json_obj appended distance
    desc: search places from parameters given
    """
    endpoint_url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    places = []
    params = {
        'location': location,
        'radius': radius,
        'types': cat,
        'key': GMAPKEY
    }
    res = requests.get(endpoint_url, params=params)
    results = json.loads(res.content)
    # return results
    places.extend(results['results'])
    time.sleep(1)
    while "next_page_token" in results:
        params['pagetoken'] = results['next_page_token'],
        res = requests.get(endpoint_url, params=params)
        results = json.loads(res.content)
        places.extend(results['results'])
        time.sleep(1)

    for idx in places:
        name = idx.get('name')
        rating = idx.get('rating')
        photo = idx.get('photos')

        vicinity = idx['vicinity']
        #photo_url = get_photo_url(photo_reference)
        if rating is None:
            rating = 0
        location = idx.get('geometry').get('location')
        lat = location.get('lat')
        lng = location.get('lng')
        place_id = idx.get('place_id')
        address = get_address(place_id)
        latlng = str(lat)+','+str(lng)
        if rating >= min_rating:
            lock.acquire()
            json_obj.append({"name": str(name), "rating": str(rating), "latlongs": [[float(lat), float(lng)]],
                             "address": str(address), "type": str(cat), "place_id": str(place_id)})
            lock.release()


def search_places_by_coordinate(location, radius, min_rating, type):#Pass in type
    """
    input: 4 strings
    output: json_obj
    desc: search places by coordinate
    """
    json_obj = []
    types = {
        'food':         ['restaurant', 'cafe', 'bar'],
        'parking':      ['parking'],
        'health':       ['dentist', 'doctor', 'hospital', 'pharmacy', 'physiotherapist'],
        'sports':       ['gym'],
        'school':       ['school'],
        'pet':          ['pet_store', 'veterinary_care'],
        'beauty':       ['hair_care', 'spa'],
        # 'entertainment':['aquarium', 'bowling_alley', 'casino', 'night club', 'shopping mall', 'zoo'],
        'necessities':  ['supermarket', 'convenience_store'],
        'ATM':          ['bank', 'atm']
    }
    threads = []
    lock = threading.Lock()
    for item in types[str(type)]:
        thread = threading.Thread(target=search_type, args=(location, radius, item, json_obj, lock, min_rating))
        threads.append(thread)
        thread.start()
    for thread in threads:
        thread.join()
    return json_obj

def get_sort_dist_indices(start_address, mode, dest_coord_list):
    """
    input: 3 strings
    output: json_obj
    desc: get distance for places in json_obj
    """
    json_obj = []
    threads = []
    lock = threading.Lock()
    for dest_coords in dest_coord_list:
        get_distance(start_address, mode, dest_coords, json_obj)
    return json_obj

def addItemToString(orig, add):
    """
    input: 2 strings
    output: string
    desc: add time from string
    """
    array = orig.split(",")
    array.append(add)
    array = list(set(array))
    return ','.join(array).strip(',')

def removeItemFromString(orig, remove):
    """
    input: 2 strings
    output: string
    desc: remove item from string
    """
    array = orig.split(",")
    array = list(set(array))
    array.remove(remove)
    return ','.join(array).strip(',')
