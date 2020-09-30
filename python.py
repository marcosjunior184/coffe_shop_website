

import http.client

connection = http.client.HTTPSConnection("www.usask.ca")
connection.request("GET", "/")
response = connection.getresponse()
print("status: {} and reason {}".format(response.status, response.reason))

print(response.read())

connection.close()