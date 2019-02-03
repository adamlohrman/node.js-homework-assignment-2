Information on how to use homework assignment #2's, Pizza Shop, API.

USER CREATION.

User - post

Request To: (yourHost)/users

Body: (.json format) 

{
  "firstName": "Your first name",
  "lastName" : "Your last name",
  "phone" : "Your phone number",
  "password" : "Your created password here",
  "email" : "Your email address here",
  "streetAddress" : "Your street address here",
  "tosAgreement" : true/false (selecting false here will not allow you to create a user. This is a boolean and doesn't require parenthasis.)
}



User - get (token required, see "tokens" section.)

Request To: (yourHost)/users?phone=(Your phone number)

Headers: token:(Your token here)

Body: No Body Required.

Response: 

{
  "firstName": "Your first name",
  "lastName" : "Your last name",
  "phone" : "Your phone number",
  "password" : "Your created password here",
  "email" : "Your email address here",
  "streetAddress" : "Your street address here",
  "tosAgreement" : true/false (selecting false here will not allow you to create a user. This is a boolean and doesn't require parenthasis.)
}



User - put (token required, see "tokens" section.)

Request To: (yourHost)/users?phone=(Your phone number)

Headers: token:(Your token here)

Body:

(The user can alter which ever value desired.)

{
  "firstName": "Your changed first name",
  "lastName" : "Your changed last name",
  "password" : "Your new password here",
  "email" : "Your changed email address here",
  "streetAddress" : "Your changed street address here",
  "tosAgreement" : true/false (selecting false here will not allow you to create a user. This is a boolean and doesn't require parenthasis.)
}

Response:

{
  "firstName": "Your changed first name",
  "lastName" : "Your changed last name",
  "password" : "Your new password here",
  "email" : "Your changed email address here",
  "streetAddress" : "Your changed street address here",
  "tosAgreement" : true/false (selecting false here will not allow you to create a user. This is a boolean and doesn't require parenthasis.)
}



User - delete (token required, see "tokens" section.)

Request To: (yourHost)/users?phone=(Your phone number.)

Body: No body data required.

Response:

 { 'Success': 'The selected customer has been deleted successfully' }

==========================================================================================================================================================================

 TOKEN CREATION

- Making a post request to tokens creates your 20 character alphanumeric token.
- Your token is only good for 24 hours after creation. If this time has lapsed, you can get a new token, by making a post request or, reset the timer, by making a put request to the tokens handler.
- Once a token is created you are considered "logged in" and the menu become available for viewing.
-[post, get, put, delete]

Tokens - post

Request To: (yourHost)/tokens

Body: 
{
  "phone": "Your phone number here",
  "password" : "Your password here"
}

Response:
{
  "phone": "Your phone number",
  "id" : "Your 20 character alphanumeric token",
  "expires" : "Amount of time left before the token expires"
}



Tokens - get 

Request To: (yourHost)/tokens?id=(Your 20 character alphanumeric token here)

Body: No body data is required for this request.

Response: 
{
  "phone": "Your phone number",
  "id" : "Your 20 character alphanumeric token",
  "expires" : "Amount of time left before the token expires"
}



Tokens - put 

Request To: (yourHost)/tokens

Body: 
{
  "id" : "Your 20 character token id here",
  "extend" : true/false (true, will extend your token expiration for another 24 hours. This is a boolean and doesn't require parenthasis.)
}

Response:
'Success': 'Your token's expiration has been extended for another 24 hours.'



Tokens - delete

Request To: (yourHost)/tokens?id=("Your 20 character token id here")

Body: No body data required.

Response: 
{'Success': 'You have deleted your token and are now logged out. Hope you have a wonderful day, come back and see us!'}

==========================================================================================================================================================================

Menu

- The menu is only accessable once a token is created.
- [get]

Menu - get

Request To: (yourHost)/menu

Headers: token : ("Your 20 character token here")

Body:
{
  "phone" : ("Your phone number here")
}

Response: 
[
  {
    "_1": {
      "name": "pepperoniFiend",
      "price": 10.99
    },
    "_2": {
      "name": "meatFiend",
      "price": 12.99
    },
    "_3": {
      "name": "veggieFiend",
      "price": 11.99
    },
    "_4": {
      "name": "hawaiianFiend",
      "price": 12.99
    }
  }
]
==========================================================================================================================================================================

Shopping Cart

- Once you've created a token, and viewed the menu, this is used to place items that you want to purchace into.

- Coming in future releases all of your orders will be compiled into one, easy to read, file that's under one id. Until then you can only select one pizza at a time,and then, how many of that one you want. That information will be placed under one id. You can then make another post request to the shoppingCart handler to add another pizza, and it's quantity, under a seperate id.

- [post, get, put, delete]

shoppingCart - post

Request To: (yourHost)/shoppingCart

Headers: token: (Your 20 character token here.)

Body: 
{
  "phone" : "Your phone number here",
  "pizzaNumber" : "Your chosen number from the menu",     (Example - "_1" or "_4")
  "quantity" : "How many of your chosen pizza here"
}

Response: (The response is returned as an array and should be called as such.)
[
    {
        "id": "Your order's id here",
        "name": "The name of the pizza here",
        "number": "The number of the pizza here",
        "price": "The price of the pizza here",
        "quantity": "Number of pizzas ordered here",
        "total": "Total price of the order"
    }
]



shoppingCart - get

Request To: (yourHost)/shoppingCart?id="Your order id here"

Headers: token: "Your 20 character token here"

Body: 
{
  "phone" : "Your phone number here"
}

Response: 
[
    {
        "id": "Your order's id here",
        "name": "The name of the pizza here",
        "pizzaNumber": "The number of the pizza here",
        "price": "The price of the pizza here",
        "quantity": "Number of pizzas ordered here",
        "total": "Total price of the order"
    }
]


shoppingCart - put

Request To: (yourHost)/shoppingCart?id="Your order id here"

Headers: token: "Your 20 character token here"

Body:
{
  "phone" : "Your provided phone number here", (required)
  "pizzaNumber" : "The pizza number you want to change to, if needed", (optional)
  "quantity" : "The amount of pizzas you want to change on the order" (optional)
}

Response:
[
    {
        "id": "Your order's id here",
        "name": "The name of the pizza here",
        "pizzaNumber": "The number of the pizza here", (will show changes, if made)
        "price": "The price of the pizza here", (will show changes, if made)
        "quantity": "Number of pizzas ordered here", (will show changes, if made)
        "total": "Total price of the order" (will show changes, if made)
    }
]

shoppingCart - delete

Request To: (yourHost)/shoppingCart?id="Your order id here"

Headers: token: "Your 20 character token here"

Body:
{
  "phone": "Your provided phone number here"
}

Response: 
{
  'Success': 'Your order was successfully deleted.'
}


==========================================================================================================================================================================

Check out

- Until it's updated, only one order id can be checked out at a time.

- Only accepts post requests.

checkOut - post

Request To: (yourHost)/checkOut?id="Your order id to be checked out here"

Headers: token: "Your 20 character token here"

Body:
{
  "cardNumber" : "tok_visa" or "tok_mastercard", 
  "email" : "your email address here",
  "phone" : "your provided phone number here"
}

Response: 
{
  'Success': 'Your payment was processed successfully and an email has been sent to your provided email address. Thank You.'
}





