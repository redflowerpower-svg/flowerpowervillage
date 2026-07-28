openapi: 3.0.1
info:
  title: Octorate Integration Central
  description: |+
    <h2>Introduction</h2>
    The Octorate Api is made up by REST calls.
    Our API follows common predictable resource-oriented URLS, accept query params bodies and returns JSON-encoded response.

    It uses these following standard verbs:
    - POST
    - DELETE
    - PATCH
    - GET

    And the usually given HTTP Response code (200, 404, etc.., <b>check glossary of common errors for details</b>)

    You can use our Api in test mode, that means that interacting with them doesn't effect the listings or the content of the user.

    The Authentication according to the agreement you've got with us is usually performed through an Oauth code that has a limited temporary expiration.
    As secondary authentication method we may accept also an "Api Key".
    The authentication must be provided in every http calls you made inside the HEADER.

    <h2>Manual And tutorials</h2>
    Please refer to the upper link <a href="./">Integration Central</a> to see tutorial, FAQ and quick start guides

    <h2>Glossary of commons errors</h2>
    <table style="width: 100%; margin-top:10px"> <tr style="background-color: #c5c5c5"> <td>Code</td><td>Full Name</td><td>Detailed description</td><td>Way to fix it</td></tr><tr style="background-color: #c5c5c5"> <td colspan="4" style="alignment: center"><b>Category 400 - Errors in your request</b></td></tr><tr> <td>400</td><td>Bad Request</td><td>Generic Bad request errors that means that content you've given to the server was rejected either by the server or the application server. </td><td>Check the format of your request and whether you're providing the right content-type headers.</td></tr><tr> <td>400</td><td>ApiParamsExemption</td><td>Application server accepted the call, but the validation of the params failed, means that you're presenting you're request to the right endpoint and with the right format, but the content is the issue there and you're missing some required param or the value is not acceptable.. </td><td>Check carefully the details to check what's missing or not set corretcly, recheck examples.</td></tr><tr> <td>400</td><td>JsonParseExemption</td><td>Probably the endpoint is right, the content type is right, but you've given a malformed json, check in a json validator online if your json structure is right.. </td><td>Use an online tool to validate your json and check where was malformed.</td></tr><tr> <td>400</td><td>ApiValidationFailed</td><td>You're request is good, your content is good, all required params are given, but it failes our internal constraints (For instance this call can be wellformed but you missed some required calls before) </td><td>Please check the content inside or push the other content that misses.</td></tr><tr style="background-color:#c5c5c5"> <td colspan="4" style="alignment: center"><b>Category 401 - Permission issues</b></td></tr><tr> <td>401</td><td>ApiKeyMissing</td><td>You've not given the access key at all</td><td>Check the headers of your call</td></tr><tr> <td>401</td><td>ApiKeyInvalid</td><td>You're presenting the api key, but this api key is wrong</td><td>Check whether the api key provided is the right one (or the access token)</td></tr><tr style="background-color: #c5c5c5"> <td colspan="4" style="alignment: center"><b>Category 403 - Access Forbidden </b></td></tr><tr> <td>403</td><td>ApiSecurityException</td><td>You have not the permission to access the requested resource (i.e. you're trying to get access of the resource not owned by the provided property) </td><td>Check if the resource is the wanted you want to access. If it is a new customer you may ask the user with oauth to the auth to access this resource </td></tr><tr> <td>403</td><td>ApiQuotaException</td><td>You've reached your quota limits</td><td>Wait for new quota, optimize your calls in order to do as few as you can</td></tr><tr> <td>403</td><td>WrongEnviroment</td><td>You are trying to execute a production call in sandbox or viceversa or in the wrong enviroment</td><td>Check where are you trying to execute your call</td></tr><tr style="background-color: #c5c5c5"> <td colspan="4" style="alignment: center"><b>Category 404 - Resource not found/available</b></td></tr><tr> <td>404</td><td>NotFound (no json details provided)</td><td>This error tells you that you're trying to call a link that doesn't exists. It can also means that the sandbox env. is not reacheable </td><td>Try in a few minutes if you're working on sandbox. Check the link you're calling, the slash, the endpoint and the typos. </td></tr><tr> <td>404</td><td>ApiResourceMissing</td><td>This error tells you a specific resource doesn't exist. It's possible that the resource has been moved or deleted, or that there's a typo in your request. </td><td>Make sure the resource exists.</td></tr><tr> <td>404</td><td>ApiResourceEmpty</td><td>Used in content in order to allow you to understand that the relative object/resource was never filled at tall </td><td>Try pushing the resource.</td></tr><tr style="background-color: #c5c5c5"> <td colspan="4" style="alignment: center"><b>Category 405 - Method not allowed</b></td></tr><tr> <td>405</td><td>MethodNotAllowed</td><td>The requested method and resource are not compatible. See the Allow header for this resource's available methods. This error means that the requested resource does not support the HTTP method you used. </td><td>Find out which methods are allowed (GET,POST,etc...) for each resource in the API Reference</td></tr><tr style="background-color: #c5c5c5"> <td colspan="4" style="alignment: center"><b>Category 422 - Unprocessable entity</b></td></tr><tr> <td>422</td><td>ApiResourceMissing</td><td>The request was well-formed but was unable to be followed due to semantic errors.</td><td></td></tr><tr style="background-color: #c5c5c5"> <td colspan="4" style="alignment: center"><b>Category 5xx - Application/Server issues</b></td></tr><tr> <td>500</td><td>InternalServerError</td><td>An unexpected internal error has occurred.</td><td>Please contact Support for more information.</td></tr><tr> <td>550</td><td>ApiPartnerServerError</td><td>One of our partner that was called to take in charge the request has failed to execute it.</td><td>please check the details to try to understand why, feel free to contact the partner or octorate at second stage. </td></tr></table>

    <h2>QUOTA</h2>

    Please take in consideration that the number of available calls is limited.
    <b> We encourage a great optimization in API usage, since quota are also calculated on basis of API needed resources, some API calls can cost much quota if they use a lot of server resources. </b> <br/>
    You can find this extra quota costs under X-RateLimit-Additional-Cost if was calculated. <br/>
    Quota <b>is dynamic</b> according to rates and properties, as reference you can take these examples

  contact:
    email: openapi@octorate.com
  license:
    name: Proprietary License
  version: |-
    1.0.DEVEL
    [payara-instance0@host00]
servers:
- url: https://api.octorate.com/connect
  description: Production - Restricted for Sandbox
security:
- OAuthLogin: []
- Key: []
tags:
- name: "Auth: Identities"
- name: Api configuration
- name: "Property: Accommodations"
- name: "Property: Reservations"
- name: "Property: Guests"
- name: "Property: Payments"
- name: "Property: Extra/Products"
- name: "Property: Checkins"
- name: "Property: Portal Connections"
- name: "Property: Cancellation policies"
- name: "Property: Invoices"
- name: "ARI: Calendar"
- name: "ARI: Rooms & Rates"
- name: "ARI: RatePlan Info"
- name: "ARI: PMS Rooms"
- name: Accounting information
  description: Identity associated to a specific token
- name: "Utilities: Enums, Metas, Fields"
  description: Rest API that helps you to discover the code conventions inside Octorate.
- name: Portals (OTA)
  description: Json Rest API that allows interacting with the portals and the portal
    connections.
- name: User information
  description: Identity associated to a specific token
- name: Webhook Subscriptions
  description: Subscribe to an event inside octorate
- name: Chat
  description: Json Rest API that allows sending and retrieving chat messages and
    threads.
- name: "Content: Portals"
  description: "Json Rest API that setups OTA connection info/content. Here the settings\
    \ will be connection specific, so for instance we expect to setup here the information\
    \ regarding the Building where apartments are located or the information about\
    \ the building of the Hotel. <br/>For rooms checks the content/room call"
- name: "Content: Rooms / Apartment"
  description: "Json Rest API that handles the creation of the content for the products\
    \ / rooms.<br/> Here the settings will be product specific, so for instance you\
    \ can configure here the photos of the room, if you need to setup the building\
    \ photos you can use the connection content api <br/> This content is the content\
    \ that we will send to Portals/OTAs. Interacting with this part means interact\
    \ with the pages /user/room/channel.xhtml (the link handle this page inside portals).\
    \ <br/> Here the content is not guaranteed to be available before we have imported\
    \ data for any external OTA. If you need to receive the content, you should register\
    \ as a new OTA. "
paths:
  /rest/v1/api/configuration:
    get:
      tags:
      - Api configuration
      summary: Read Configuration
      description: "Retrieve the current configuration. Use this method to <br/><ul><li>Check\
        \ your current redirect uri</li><li>Setup information like your name, category\
        \ or icon</li><li>Check your configuration: i.e. licence, allowed permissions,\
        \ if you are in sandbox mode, if you have any reseller account linked </li></ul>"
      operationId: getConfiguration
      responses:
        "200":
          description: Processed
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ApiConfigurationResponse"
      security:
      - ApiOperations: []
    patch:
      tags:
      - Api configuration
      summary: Write Configuration
      description: "Setup your api options, you can either specify one of requested\
        \ fields or all of them, we will process only the changed one. <br/> Ideally,\
        \ you should to this step at least the first time"
      operationId: postConfiguration
      requestBody:
        content:
          '*/*':
            schema:
              $ref: "#/components/schemas/ApiConfigurationRequest"
      responses:
        "200":
          description: Processed
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ApiConfigurationResponse"
      security:
      - ApiOperations: []
  /rest/v1/meta/contentPageFields:
    get:
      tags:
      - "Utilities: Enums, Metas, Fields"
      summary: Retrieve content page meta
      description: "Retrieve the page elements for pushing the room, you can use them\
        \ in according with portal configuration to setup the page to push"
      operationId: getContentPageMeta
      responses:
        default:
          description: default response
          content:
            '*/*': {}
  /rest/v1/meta/portals:
    get:
      tags:
      - "Utilities: Enums, Metas, Fields"
      description: Retrieve available portals
      operationId: OTAs List
      responses:
        "200":
          description: List of portals
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ApiPortalDTOResp"
        "400":
          description: Request was made wrongly
        "403":
          description: Access Denied. Access to the resource denied
      security:
      - ApiOperations: []
  /rest/v1/meta/documents:
    get:
      tags:
      - "Utilities: Enums, Metas, Fields"
      description: Retrieve all kind of available documents
      operationId: "CHK: Documents"
      responses:
        default:
          description: default response
          content:
            '*/*': {}
  /rest/v1/meta/octorateAmenities:
    get:
      tags:
      - "Utilities: Enums, Metas, Fields"
      description: Retrieve Octorate Amenities. This is a subset of the ones the portals
        supports but we have chosen to make only these available
      operationId: searchAmenity
      parameters:
      - name: id
        in: query
        schema:
          type: integer
          format: int64
      - name: name
        in: query
        schema:
          type: string
      responses:
        default:
          description: default response
          content:
            application/json: {}
  /rest/v1/meta/content:
    get:
      tags:
      - "Utilities: Enums, Metas, Fields"
      operationId: searchContentItem
      parameters:
      - name: name
        in: query
        schema:
          type: string
      - name: portal
        in: query
        schema:
          type: string
          description: Name of the portal (octorate name) where retrieve information
            (i.e. amenities)
      - name: category
        in: query
        schema:
          type: string
          description: "Type of content (i.e. amenities, benefits, cancel policies...)"
          enum:
          - FEE_PERSONAL
          - CHARGE_TYPE
          - IMAGE_TAGS
          - SERVICE
          - PAYMENTS_CARD
          - LANGUAGES
          - BREAKFAST
          - CANCEL_POLICY
          - ROOM_AMENITY
          - INTERNET_CONNECTION_TYPES
          - INTERNET_CONNECTION_COVERAGE
          - PARKING_TYPE
          - BED_TYPE
          - CONTACT_TYPE
          - CONTACT_LANGUAGE
          - EXTRABED_GUEST_TYPE
          - BOOKING_ACCEPTED_GUESTS
          - FEE_TAX
          - RATE_OFFER
          - PRODUCT_BENEFIT
          - ACCOMMODATION_CATEGORY
          - CITY_TAX_CATEGORY
          - CITY_TAX_NATURE
          - CANCEL_POLICY_DEPOSIT
          - ROOM_CATEGORY
          - ROOM_CLASS
          - BEDROOM_TYPE
          - ROOM_NAMING
          - PHOTO_TYPE
          - LISTING_EXPECTATION
          - PROPERTY_CHECKIN_METHOD
          - BATHROOM_LOCATION
      responses:
        default:
          description: Success
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ApiListResponse"
  /rest/v1/portal/apiportal:
    put:
      tags:
      - Portals (OTA)
      summary: Update the API portal
      description: Some Application wants to receive ARI (Availability and rates inventory)
        from Octorate. In order to do it you should before create a new Portal inside
        the Octorate system. This call will update the current details.
      operationId: updatePortal
      requestBody:
        description: The Portal (OTA) You're going to update. (Configuration)
        content:
          '*/*':
            schema:
              $ref: "#/components/schemas/ApiPortalRequestDTO"
      responses:
        default:
          description: default response
          content:
            application/json: {}
      security:
      - ApiOperations: []
    post:
      tags:
      - Portals (OTA)
      summary: Create the API portal
      description: Some Application wants to receive ARI (Availability and rates inventory)
        from Octorate. In order to do it you should before create a new Portal inside
        the Octorate system
      operationId: createPortal
      requestBody:
        description: The Portal (OTA) You're going to create (Configuration).
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ApiPortalRequestDTO"
      responses:
        default:
          description: default response
          content:
            application/json: {}
      security:
      - ApiOperations: []
  /rest/v1/user/info:
    get:
      tags:
      - User information
      description: Retrieve information about an user
      operationId: info
      responses:
        "200":
          description: Response processed
          content:
            application/json:
              examples:
                response:
                  description: response
                  value:
                    name: John Snow
                    email: mymail@test.it
                    username: octo_john
      security:
      - OAuthLogin: []
  /rest/v1/subscription/{event}:
    post:
      tags:
      - Webhook Subscriptions
      description: "Create a new subscription (webhook). You can configure webhook\
        \ endpoints via the API to be notified about events that happen in your connected\
        \ Octorate Customers.<br/><br/>In the section on the right you can see one\
        \ or two example of the notification you can receive. Generally is you already\
        \ known reservation,room,etc... wrapped with some additional information like\
        \ the create time or the webhook ID.<br/><br/>We divide the available subscriptions\
        \ by these types:<br/>- Available for OTAs: If you are an Online travel agency,\
        \ you can subscribe to calendar updates and content push updates in order\
        \ to keep your portal updated.<br/>- Normal subscription: You can receive\
        \ subscription regarding an update of the reservation, a change of it or when\
        \ other events related to the user are triggered.<br/><br/><b> Retry logic\
        \ </b><br/>Octorate will attemp to deliver the webhooks for up to 2 days,\
        \ delaying more and more the attemps. <br/>Generally,<br/>- if you reply with\
        \ the HTTP response code 200, we will assume the webhook as notified<br/>-\
        \ All other codes will means to retry<br/>- 406 (Not acceptable content) is\
        \ the only exception that will stop Octorate retrying.<br/><br/><b> Constraints\
        \ </b><br/>- Please take note that the timeout given you to reply is very\
        \ short. Do any time-expensive operation AFTER you have received the webhook.<br/><br/><b>\
        \ Order of events </b><br/>- We try to give you events in order but order\
        \ is not guaranteed. Please be preparated to receive any other necessary info\
        \ after (We give unique id in the responses and the possibility to pull object\
        \ that you may miss when the request arrives).<br/><br/><b> Duplicates event\
        \ </b><br/>- Generally, many consecutive attempts to send the same content\
        \ inside a 5 minutes request, will result in one webhook only."
      operationId: createSubscription
      parameters:
      - name: event
        in: path
        required: true
        schema:
          type: string
          description: The type of event you want to subscribe to
          enum:
          - RESERVATION_CREATED
          - RESERVATION_CHANGE
          - RESERVATION_CANCELLED
          - RESERVATION_CONFIRMED
          - CONTENT_NOTIFICATION
          - CONTENT_PUSH
          - PORTAL_SUBSCRIPTION_CALENDAR
          - XXX_NOT_USED_PORTAL_PROCESS_FAILED
          - CHAT_MESSAGE_RECEIVED
      requestBody:
        content:
          application/x-www-form-urlencoded:
            schema:
              type: object
              properties:
                url:
                  type: string
                  description: An https:// address of your website where we will notify
                    the webhook
      responses:
        "200":
          description: 'Response successfully processed. '
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/WebhookSubscription"
              examples:
                Response 200:
                  description: Response 200
                  value: "{\"apiMember\":000,\"createTime\":\"2020-03-18T14:46:08.693Z[UTC]\"\
                    ,\"endpoint\":\"ngrok.io/aaaaaaa\",\"id\":1,\"type\":\"CONTENT_NOTIFICATION\"\
                    }"
                Example of Webhook for Reservation Subscription:
                  description: Example of Webhook for Reservation Subscription
                  value:
                    content: "{\"channelId\":233,\"channelRefer\":\"KW6PE8\",\"checkin\"\
                      :\"2020-03-19T23:00:00Z[UTC]\",\"checkout\":\"2020-03-26T04:00:00Z[UTC]\"\
                      ,\"createTime\":\"2020-03-17T13:49:01Z[UTC]\",\"guests\":[{\"\
                      checkin\":\"2020-03-20\",\"checkout\":\"2020-03-26\",\"email\"\
                      :\"test@test.it\",\"familyName\":\"Test\",\"givenName\":\"TEst\"\
                      ,\"language\":\"EN\",\"phone\":\"\",\"source\":\"USER\",\"type\"\
                      :\"BOOKER\"}],\"pmsProduct\":0,\"product\":267798,\"refer\"\
                      :\"KW6PE8\",\"status\":\"CONFIRMED\",\"totalGross\":5994.00,\"\
                      totalGuest\":4,\"updateTime\":\"2020-03-17T13:49:01Z[UTC]\"\
                      ,\"channelName\":\"Octorate\",\"currency\":\"EUR\",\"freeCancellation\"\
                      :true,\"id\":92151096,\"paymentStatus\":\"UNPAID\",\"paymentType\"\
                      :\"UNKNOWN\",\"payments\":[],\"priceBreakdown\":[{\"day\":\"\
                      2020-03-20\",\"included\":true,\"price\":999.00,\"reference\"\
                      :\"6216095\",\"type\":\"DAILY_ROOM_PRICE\"},{\"day\":\"2020-03-21\"\
                      ,\"included\":true,\"price\":999.00,\"reference\":\"6216091\"\
                      ,\"type\":\"DAILY_ROOM_PRICE\"},{\"day\":\"2020-03-22\",\"included\"\
                      :true,\"price\":999.00,\"reference\":\"6216092\",\"type\":\"\
                      DAILY_ROOM_PRICE\"},{\"day\":\"2020-03-23\",\"included\":true,\"\
                      price\":999.00,\"reference\":\"6216093\",\"type\":\"DAILY_ROOM_PRICE\"\
                      },{\"day\":\"2020-03-24\",\"included\":true,\"price\":999.00,\"\
                      reference\":\"6216096\",\"type\":\"DAILY_ROOM_PRICE\"},{\"day\"\
                      :\"2020-03-25\",\"included\":true,\"price\":999.00,\"reference\"\
                      :\"6216094\",\"type\":\"DAILY_ROOM_PRICE\"},{\"included\":true,\"\
                      price\":5994.00,\"type\":\"ROOM_NET\"},{\"included\":true,\"\
                      price\":0.00,\"type\":\"VAT\"}],\"roomGross\":5994.00,\"totalChildren\"\
                      :0,\"totalInfants\":0,\"touristTax\":0, \"accommodation\":{\"\
                      id\":\"16997\"}}"
                    id: 1
                    reference: "92151096"
                    retry: 13
                    subscription:
                      apiMember: 359
                      createTime: "2020-03-17T14:34:18Z[UTC]"
                      endpoint: https://9d3731e3.ngrok.io
                      id: 1
                      processTime: "2020-03-17T14:49:30Z[UTC]"
                      type: RESERVATION_CREATED
                    type: RESERVATION_CREATED
                Example of Webhook for Content Subscription:
                  description: Example of Webhook for Content Subscription
                  value:
                    content: "{\"message\":\"Tu anuncio necesita fotos para poder\
                      \ ser activado.\",\"octorateProduct\":318059,\"success\":false}"
                    id: 1
                    reference: "92151096"
                    retry: 13
                    subscription:
                      apiMember: 12
                      createTime: "2020-03-17T14:34:18Z[UTC]"
                      endpoint: https://9d3731e3.ngrok.io
                      id: 1
                      processTime: "2020-03-17T14:49:30Z[UTC]"
                      type: CONTENT_NOTIFICATION
                    type: CONTENT_NOTIFICATION
                Example of Webhook for Calendar Subscription:
                  description: Example of Webhook for Calendar Subscription
                  value:
                    content: "{\"data\":[{\"id\":438390,\"name\":\"Room or Rate Name\"\
                      ,\"days\":[{\"availability\":0,\"closeToArrival\":false,\"closeToDeparture\"\
                      :false,\"cutOffDays\":0,\"days\":[\"2024-01-15\",\"2024-01-16\"\
                      ,\"2024-12-30\",\"2024-12-31\"],\"maxStay\":99,\"minStay\":1,\"\
                      price\":9999.00,\"stopSells\":false}]}]}"
                    createTime: "2024-01-15T14:27:44.683Z[UTC]"
                    hmac: 85047391f9d79e6a2bf6aff8c417be58d5014d06
                    reference: "143186"
                    retry: 11
                    subscription:
                      apiMember: 451
                      createTime: "2022-07-19T14:37:51Z[UTC]"
                      enabled: true
                      endpoint: https://hcm.hyperguest.io/api/hcm/pms/octorate/v1/ari-update
                      id: 835
                      priority: 1
                      processTime: "2023-03-28T22:54:19Z[UTC]"
                      type: PORTAL_SUBSCRIPTION_CALENDAR
                    type: PORTAL_SUBSCRIPTION_CALENDAR
  /rest/v1/subscription/{id}:
    put:
      tags:
      - Webhook Subscriptions
      description: Update the current subscription
      operationId: updateSubscription
      parameters:
      - name: id
        in: path
        required: true
        schema:
          type: integer
          format: int64
      - name: url
        in: query
        schema:
          type: string
      responses:
        default:
          description: default response
          content:
            application/json: {}
    delete:
      tags:
      - Webhook Subscriptions
      description: Delete an existing subscription
      operationId: deleteSubscription
      parameters:
      - name: id
        in: path
        required: true
        schema:
          type: integer
          format: int64
      responses:
        default:
          description: default response
          content:
            application/json: {}
  /rest/v1/subscription/list:
    get:
      tags:
      - Webhook Subscriptions
      description: Retrieve the supported subscriptions
      operationId: listSubscriptions
      responses:
        default:
          description: default response
          content:
            application/json: {}
  /rest/v1/subscription:
    get:
      tags:
      - Webhook Subscriptions
      description: Retrieve actived subscriptions
      operationId: retrieveSubscriptions
      responses:
        default:
          description: default response
          content:
            application/json: {}
  /rest/v1/accommodation/network/{network}:
    get:
      tags:
      - "Property: Accommodations"
      description: Retrieve a collection of properties that belongs to the same group
      operationId: retrieveNetwork
      parameters:
      - name: network
        in: path
        required: true
        schema:
          type: string
      - name: fields
        in: query
        description: "List of fields to filter in the response. Can be usefull to\
          \ save bandwith and get quicker response from this server. Values are separated\
          \ by comma, only applies to the first level, like this: 'checkin, guests'.\
          \ Default fields are: id,name,currency,timeZone,timeZoneOffset,phoneNumber,address,latitude,longitude,zipCode,city,checkinStart,checkinEnd,checkout"
        schema:
          type: string
        example: "id,name,currency,timeZone,timeZoneOffset,phoneNumber,address,latitude,longitude,zipCode,city,checkinStart,checkinEnd,checkout"
      responses:
        default:
          description: default response
          content:
            '*/*': {}
      security:
      - ApiOperations: []
    post:
      tags:
      - "Property: Accommodations"
      description: Add the accommodation provided to an existing network
      operationId: addToNetwork
      parameters:
      - name: network
        in: path
        required: true
        schema:
          type: string
      - name: accommodation
        in: query
        schema:
          type: array
          items:
            type: string
      responses:
        default:
          description: default response
          content:
            '*/*': {}
      security:
      - ApiOperations: []
  /rest/v1/accommodation/network:
    get:
      tags:
      - "Property: Accommodations"
      description: Get all the accommodations that belongs to the same network of
        the provided accommodation
      operationId: getNetwork
      parameters:
      - name: accommodationId
        in: query
        schema:
          type: string
      - name: excludeCurrent
        in: query
        schema:
          type: boolean
      - name: fields
        in: query
        schema:
          type: string
      responses:
        "200":
          description: Processed
        "403":
          description: Access Denied. Access to the resource denied
        "500":
          description: Internal Server Error
    post:
      tags:
      - "Property: Accommodations"
      description: Create a new network of accommodations
      operationId: createNetwork
      parameters:
      - name: accommodation
        in: query
        schema:
          type: array
          items:
            type: string
      responses:
        default:
          description: default response
          content:
            '*/*': {}
      security:
      - ApiOperations: []
  /rest/v1/accommodation/{accommodation}:
    get:
      tags:
      - "Property: Accommodations"
      operationId: retrieveAccommodation
      parameters:
      - name: accommodation
        in: path
        required: true
        schema:
          type: string
      - name: fields
        in: query
        description: "List of fields to filter in the response. Can be usefully to\
          \ save bandwidth and get quicker response from this server. Values are separated\
          \ by comma, only applies to the first level, like this: 'name,address'.\
          \ Default fields are: id,name,currency,timeZone,timeZoneOffset,phoneNumber,address,latitude,longitude,zipCode,city,checkinStart,checkinEnd,checkout"
        schema:
          type: string
        example: "id,name,currency,timeZone,timeZoneOffset,phoneNumber,address,latitude,longitude,zipCode,city,checkinStart,checkinEnd,checkout"
      responses:
        "200":
          description: Processed
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ApiAccommodationDTO"
    delete:
      tags:
      - "Property: Accommodations"
      description: Delete the specified property
      operationId: deleteAccommodation
      parameters:
      - name: accommodation
        in: path
        description: Accommodation Id
        required: true
        schema:
          type: string
      responses:
        "200":
          description: Accommodation successfully deleted
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ApiAccommodationDTO"
      security:
      - ApiOperations: []
  /rest/v1/accommodation/{accommodation}/account:
    delete:
      tags:
      - "Property: Accommodations"
      description: Deactivate the specified property account without permanently deleting
        it
      operationId: deleteAccount
      parameters:
      - name: accommodation
        in: path
        description: Accommodation Id
        required: true
        schema:
          type: string
      responses:
        "200":
          description: Accommodation account successfully deactivated
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ApiAccommodationDTO"
      security:
      - ApiOperations: []
  /rest/v1/accommodation/{accommodation}/photos/{name}:
    delete:
      tags:
      - "Property: Accommodations"
      description: Delete a photo of the property
      operationId: deletePhoto
      parameters:
      - name: accommodation
        in: path
        description: The ID of the accommodation
        required: true
        schema:
          type: string
      - name: name
        in: path
        description: Previously retrieved photo name
        required: true
        schema:
          type: string
      responses:
        default:
          description: default response
          content:
            '*/*': {}
  /rest/v1/accommodation/{accommodationId}/icsLink:
    get:
      tags:
      - "Property: Accommodations"
      description: Retrieve the ICS Calendar link for the provided accommodation
      operationId: getIcsLink
      parameters:
      - name: accommodationId
        in: path
        required: true
        schema:
          type: string
      responses:
        default:
          description: default response
          content:
            '*/*': {}
      security:
      - ApiOperations: []
  /rest/v1/accommodation/{accommodation}/photos:
    get:
      tags:
      - "Property: Accommodations"
      description: Retrieve photos
      operationId: getPhotos
      parameters:
      - name: accommodation
        in: path
        description: The ID of the accommodation
        required: true
        schema:
          type: string
      responses:
        default:
          description: default response
          content:
            application/json: {}
    post:
      tags:
      - "Property: Accommodations"
      description: Push a PHOTO to the property
      operationId: pushPhotos
      parameters:
      - name: accommodation
        in: path
        description: The accommodation codice
        required: true
        schema:
          type: string
      - name: url
        in: query
        description: URL to fetch to retrieve the photo (You can use query or form
          param as you prefer)
        schema:
          type: string
      requestBody:
        content:
          application/x-www-form-urlencoded:
            schema:
              type: object
              properties:
                url:
                  type: string
                  description: "URL to fetch to retrieve the photo (Form encoded,\
                    \ alternative)"
      responses:
        default:
          description: default response
          content:
            '*/*': {}
  /rest/v1/accommodation/recentMessages:
    get:
      tags:
      - "Property: Accommodations"
      summary: Recent messages
      description: Gets all message created in the last 24 hours for the provided
        accommodation.
      operationId: getRecentMessages
      parameters:
      - name: property
        in: query
        description: The accommodation id
        schema:
          type: string
      responses:
        "200":
          description: List of messages
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/ChatMessageDTO"
        "403":
          description: Access Denied. Access to the resource denied
        "500":
          description: Internal Server Error
  /rest/v1/accommodation/{accommodation}/queue:
    get:
      tags:
      - "Property: Accommodations"
      description: Check the photo upload queue
      operationId: queueAccommodation
      parameters:
      - name: accommodation
        in: path
        description: Accommodation
        required: true
        schema:
          type: string
      responses:
        default:
          description: default response
          content:
            '*/*': {}
  /rest/v1/accommodation:
    get:
      tags:
      - "Property: Accommodations"
      description: "Find accommodations created or attached. Response will vary according\
        \ to the security provided (All the properties with ApiOperations, Only token\
        \ properties with OAuthLogin)"
      operationId: retrieveAccommodations
      parameters:
      - name: page
        in: query
        description: The page number
        schema:
          type: integer
          format: int32
      - name: name
        in: query
        description: Name of accommodation or codice (contains)
        schema:
          type: string
      - name: mail
        in: query
        description: Mail to filter (exact match)
        schema:
          type: string
      responses:
        "200":
          description: Processed
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/ApiAccommodationDTO"
              examples:
                example of response:
                  description: example of response
                  value:
                  - currency: EUR
                    id: "47260"
                    name: Silvia Test Api Master
                    timeZone: Europe/Rome
                    contact:
                      email: tech@dormoa.com
                      familyName: Silvia
                      givenName: Silvia
                      mobileNumber: ""
                      mobilePrefix: "+39"
                    location:
                      city: Roma
                      country: IT
                      districtName: ""
                      latitude: 0.0
                      longitude: 0.0
                      zipCode: ""
                      zoom: 13
                    networkActive: true
                    networkInfo:
                      accessEnabled: true
                      accessNetwork: "314142"
                      accessRoot: true
                    propertyCategory: OTHER
                  - currency: EUR
                    id: "314142"
                    name: Silvia Test Api
                    timeZone: Europe/Rome
                    contact:
                      email: tech@dormoa.com
                      familyName: Silvia
                      givenName: Silvia
                      mobileNumber: ""
                      mobilePrefix: "+39"
                    location:
                      city: Roma
                      country: IT
                      districtName: ""
                      latitude: 0.0
                      longitude: 0.0
                      zipCode: ""
                      zoom: 13
                    networkActive: true
                    networkInfo:
                      accessEnabled: true
                      accessNetwork: "314142"
                      accessRoot: false
                    propertyCategory: OTHER
                  - currency: EUR
                    id: "450020"
                    name: Silvia Test Api Account 2
                    timeZone: Europe/Rome
                    contact:
                      email: tech@dormoa.com
                      familyName: Silvia
                      givenName: Silvia
                      mobileNumber: ""
                      mobilePrefix: "+39"
                    location:
                      city: Roma
                      country: IT
                      districtName: ""
                      latitude: 0.0
                      longitude: 0.0
                      zipCode: ""
                      zoom: 13
                    networkActive: true
                    networkInfo:
                      accessEnabled: true
                      accessNetwork: "314142"
                      accessRoot: false
                    propertyCategory: OTHER
      security:
      - ApiOperations: []
      - OAuthLogin: []
  /rest/v1/accommodation/{accommodation}/masterBilling:
    get:
      tags:
      - "Property: Accommodations"
      operationId: retrieveMasterBillingAccommodation
      parameters:
      - name: accommodation
        in: path
        required: true
        schema:
          type: string
      - name: fields
        in: query
        description: "List of fields to filter in the response. Can be usefully to\
          \ save bandwidth and get quicker response from this server. Values are separated\
          \ by comma, only applies to the first level, like this: 'name,address'.\
          \ Default fields are: id,name,currency,timeZone,timeZoneOffset,phoneNumber,address,latitude,longitude,zipCode,city,checkinStart,checkinEnd,checkout"
        schema:
          type: string
        example: "id,name,currency,timeZone,timeZoneOffset,phoneNumber,address,latitude,longitude,zipCode,city,checkinStart,checkinEnd,checkout"
      responses:
        "200":
          description: Processed
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ApiAccommodationDTO"
  /rest/v1/accommodation/{accommodation}/queue/{id}:
    get:
      tags:
      - "Property: Accommodations"
      description: Check on the queue the status of the task provided
      operationId: retrieveTask
      parameters:
      - name: accommodation
        in: path
        description: Accommodation
        required: true
        schema:
          type: string
      - name: id
        in: path
        description: Id/Token of the photo to check
        required: true
        schema:
          type: integer
          format: int64
      responses:
        default:
          description: default response
          content:
            '*/*': {}
  /rest/v1/chat/{property}/threads/members/{personId}:
    put:
      tags:
      - Chat
      description: Add the given person to all threads of the accommodation network
        (according to user permissions)
      operationId: addMemberToAllThreads
      parameters:
      - name: property
        in: path
        required: true
        schema:
          type: string
      - name: personId
        in: path
        required: true
        schema:
          type: integer
          format: int64
      responses:
        "200":
          description: Processed
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/ChatThreadDTO"
        "403":
          description: Access Denied. Access to the resource denied
        "500":
          description: Internal Server Error
    delete:
      tags:
      - Chat
      description: Remove the given person from all threads of the accommodation network
      operationId: removeMemberFromAllThreads
      parameters:
      - name: property
        in: path
        required: true
        schema:
          type: string
      - name: personId
        in: path
        required: true
        schema:
          type: integer
          format: int64
      responses:
        "200":
          description: Processed
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/ChatThreadDTO"
        "403":
          description: Access Denied. Access to the resource denied
        "500":
          description: Internal Server Error
  /rest/v1/chat/{property}/threads/{thread}/archive:
    patch:
      tags:
      - Chat
      description: Archive the thread
      operationId: archiveThread
      parameters:
      - name: property
        in: path
        required: true
        schema:
          type: string
      - name: thread
        in: path
        required: true
        schema:
          type: integer
          format: int64
      responses:
        "200":
          description: Processed
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ChatThreadDTO"
        "400":
          description: Malformed request body
        "403":
          description: Access Denied. Access to the resource denied
        "500":
          description: Internal Server Error
  /rest/v1/chat/{property}/messages:
    get:
      tags:
      - Chat
      description: Search inside all chat messages for the queryString param. The
        search is performed on REFER (portal reservation ID) or Guest name.
      operationId: findMessages
      parameters:
      - name: property
        in: path
        required: true
        schema:
          type: string
      - name: queryString
        in: query
        schema:
          type: string
      responses:
        "200":
          description: Processed
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/ChatThreadDTO"
        "403":
          description: Access Denied. Access to the resource denied
        "500":
          description: Internal Server Error
    post:
      tags:
      - Chat
      description: Create a new chat message
      operationId: createMessage
      parameters:
      - name: property
        in: path
        required: true
        schema:
          type: string
      requestBody:
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ChatMessageDTO"
        required: true
      responses:
        "200":
          description: Processed
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ChatMessageDTO"
        "400":
          description: Malformed request body
        "403":
          description: Access Denied. Access to the resource denied
        "500":
          description: Internal Server Error
  /rest/v1/chat/{property}/threads/{threadId}/preApprove:
    post:
      tags:
      - Chat
      description: Create a new special offer
      operationId: createPreApproval
      parameters:
      - name: property
        in: path
        required: true
        schema:
          type: string
      - name: threadId
        in: path
        required: true
        schema:
          type: integer
          format: int64
      responses:
        "200":
          description: Processed
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/SpecialOfferDTO"
        "400":
          description: Malformed request body
        "403":
          description: Access Denied. Access to the resource denied
        "500":
          description: Internal Server Error
  /rest/v1/chat/{property}/threads/{threadId}/specialOffer:
    post:
      tags:
      - Chat
      description: Create a new special offer
      operationId: createSpecialOffer
      parameters:
      - name: property
        in: path
        required: true
        schema:
          type: string
      - name: threadId
        in: path
        required: true
        schema:
          type: integer
          format: int64
      requestBody:
        content:
          application/json:
            schema:
              type: string
      responses:
        "200":
          description: Processed
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/SpecialOfferDTO"
        "400":
          description: Malformed request body
        "403":
          description: Access Denied. Access to the resource denied
        "500":
          description: Internal Server Error
  /rest/v1/chat/{property}/threads/{id}:
    get:
      tags:
      - Chat
      description: Retrieve chat thread
      operationId: getThread
      parameters:
      - name: property
        in: path
        required: true
        schema:
          type: string
      - name: id
        in: path
        required: true
        schema:
          type: integer
          format: int64
      responses:
        "200":
          description: Processed
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ChatThreadDTO"
        "403":
          description: Access Denied. Access to the resource denied
        "500":
          description: Internal Server Error
  /rest/v1/chat/{property}/threads/{thread}/messages:
    get:
      tags:
      - Chat
      description: Retrieve all recent chat messages of the specified thread
      operationId: getThreadMessages
      parameters:
      - name: property
        in: path
        required: true
        schema:
          type: string
      - name: thread
        in: path
        required: true
        schema:
          type: integer
          format: int64
      - name: createdAfter
        in: query
        schema:
          type: string
          format: date-time
      - name: fields
        in: query
        schema:
          type: string
      responses:
        "200":
          description: Processed
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ApiListResponse"
        "403":
          description: Access Denied. Access to the resource denied
        "500":
          description: Internal Server Error
  /rest/v1/chat/{property}/threads/{thread}/templates:
    get:
      tags:
      - Chat
      description: Retrieve all chat messages of the specified thread
      operationId: getThreadTemplates
      parameters:
      - name: property
        in: path
        required: true
        schema:
          type: string
      - name: thread
        in: path
        required: true
        schema:
          type: integer
          format: int64
      responses:
        "200":
          description: Processed
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/MailTemplateDTO"
        "403":
          description: Access Denied. Access to the resource denied
        "500":
          description: Internal Server Error
  /rest/v1/chat/{property}/threads:
    get:
      tags:
      - Chat
      description: Retrieve chat threads
      operationId: getThreads
      parameters:
      - name: property
        in: path
        required: true
        schema:
          type: string
      - name: offset
        in: query
        schema:
          type: integer
          format: int64
      - name: filterReadStatus
        in: query
        schema:
          type: boolean
      responses:
        "200":
          description: Processed
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/ChatThreadDTO"
        "403":
          description: Access Denied. Access to the resource denied
        "500":
          description: Internal Server Error
  /rest/v1/chat/{property}/unreadedMessagesCount:
    get:
      tags:
      - Chat
      description: Count unreaded messages in the last 30 days of all threads of the
        user
      operationId: getUnreadedMessagesCount
      parameters:
      - name: property
        in: path
        required: true
        schema:
          type: string
      responses:
        "200":
          description: Processed
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/ChatMessageDTO"
        "403":
          description: Access Denied. Access to the resource denied
        "500":
          description: Internal Server Error
  /rest/v1/chat/{property}/messages/readAll:
    patch:
      tags:
      - Chat
      description: Add the user in the list of readers of all messages
      operationId: readAllThreads
      parameters:
      - name: property
        in: path
        required: true
        schema:
          type: string
      responses:
        "200":
          description: Processed
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ApiListResponse"
        "403":
          description: Access Denied. Access to the resource denied
        "500":
          description: Internal Server Error
  /rest/v1/chat/{propertyId}/threads/{threadId}/read:
    patch:
      tags:
      - Chat
      description: Add the user in the list of readers of all the messages of the
        thread
      operationId: readThread
      parameters:
      - name: propertyId
        in: path
        required: true
        schema:
          type: string
      - name: threadId
        in: path
        required: true
        schema:
          type: string
      responses:
        "200":
          description: Processed
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ChatMessageReaderDTO"
        "403":
          description: Access Denied. Access to the resource denied
        "500":
          description: Internal Server Error
  /rest/v1/chat/{accommodationId}/threads/{thread}/aiAssistant:
    patch:
      tags:
      - Chat
      description: Enable AI Assistant for the thread
      operationId: setAiAssistant
      parameters:
      - name: accommodationId
        in: path
        required: true
        schema:
          type: string
      - name: thread
        in: path
        required: true
        schema:
          type: integer
          format: int64
      - name: enabled
        in: query
        schema:
          type: boolean
      responses:
        "200":
          description: Processed
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ChatThreadDTO"
        "400":
          description: Malformed request body
        "403":
          description: Access Denied. Access to the resource denied
        "500":
          description: Internal Server Error
  /rest/v1/chat/{property}/threads/{thread}/processor:
    patch:
      tags:
      - Chat
      description: Update the default processor of this thread
      operationId: setDefaultProcessor
      parameters:
      - name: property
        in: path
        required: true
        schema:
          type: string
      - name: thread
        in: path
        required: true
        schema:
          type: integer
          format: int64
      requestBody:
        content:
          '*/*':
            schema:
              type: string
      responses:
        "200":
          description: Processed
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ChatThreadDTO"
        "400":
          description: Malformed request body
        "403":
          description: Access Denied. Access to the resource denied
        "500":
          description: Internal Server Error
  /rest/v1/chat/{accommodationId}/threads/{thread}/setAsUnread:
    patch:
      tags:
      - Chat
      description: Sets a chat thread as unread
      operationId: setThreadAsUnread
      parameters:
      - name: accommodationId
        in: path
        required: true
        schema:
          type: string
      - name: thread
        in: path
        required: true
        schema:
          type: integer
          format: int64
      responses:
        "200":
          description: Processed
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ChatThreadDTO"
        "400":
          description: Malformed request body
        "403":
          description: Access Denied. Access to the resource denied
        "500":
          description: Internal Server Error
  /rest/v1/chat/{property}/threads/{threadId}/messages/{messageId}/translate/{language}:
    patch:
      tags:
      - Chat
      description: Translate the message to the requested language
      operationId: translateMessage
      parameters:
      - name: property
        in: path
        required: true
        schema:
          type: string
      - name: threadId
        in: path
        required: true
        schema:
          type: integer
          format: int64
      - name: messageId
        in: path
        required: true
        schema:
          type: integer
          format: int64
      - name: language
        in: path
        required: true
        schema:
          type: string
          enum:
          - IT
          - EN
          - FR
          - ES
          - DE
          - RU
          - PT
          - NL
          - JA
          - EL
          - TR
          - ZH
          - CA
          - RO
      responses:
        "200":
          description: Processed
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ChatMessageDTO"
        "400":
          description: Malformed request body
        "403":
          description: Access Denied. Access to the resource denied
        "500":
          description: Internal Server Error
  /rest/v1/chat/{property}/messages/{messageId}:
    put:
      tags:
      - Chat
      description: Update the message status
      operationId: updateMessage
      parameters:
      - name: property
        in: path
        required: true
        schema:
          type: string
      - name: messageId
        in: path
        required: true
        schema:
          type: integer
          format: int64
      requestBody:
        content:
          application/json:
            schema:
              type: string
      responses:
        "200":
          description: Processed
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ChatMessageDTO"
        "400":
          description: Malformed request body
        "403":
          description: Access Denied. Access to the resource denied
        "500":
          description: Internal Server Error
  /rest/v1/chat/{property}/threads/{threadId}/specialOffer/{specialOfferId}/withdraw:
    patch:
      tags:
      - Chat
      description: Withdraw the special offer
      operationId: withdrawSpecialOffer
      parameters:
      - name: property
        in: path
        required: true
        schema:
          type: string
      - name: threadId
        in: path
        required: true
        schema:
          type: integer
          format: int64
      - name: specialOfferId
        in: path
        required: true
        schema:
          type: integer
          format: int64
      responses:
        "200":
          description: Processed
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/SpecialOfferDTO"
        "403":
          description: Access Denied. Access to the resource denied
        "500":
          description: Internal Server Error
  /rest/v1/content/connections/{connection}/cancellationPolicies/{portalValue}:
    delete:
      tags:
      - "Content: Portals"
      summary: "Cancellation Policy [DELETE]"
      description: Delete an existing cancellation policy
      operationId: deleteCancellationPolicy
      parameters:
      - name: connection
        in: path
        description: 'The ID of the portal connection '
        required: true
        schema:
          type: integer
          format: int64
      - name: portalValue
        in: path
        required: true
        schema:
          type: string
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: "Internal Server Error, something bad occourend on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      security:
      - OAuthLogin: []
  /rest/v1/content/connections/{connection}/contacts/{contactType}:
    delete:
      tags:
      - "Content: Portals"
      summary: "Contact [DELETE]"
      description: Remove a contact by his index
      operationId: deleteContact
      parameters:
      - name: connection
        in: path
        description: 'The ID of the portal connection '
        required: true
        schema:
          type: integer
          format: int64
      - name: contactType
        in: path
        required: true
        schema:
          type: string
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: "Internal Server Error, something bad occourend on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      security:
      - OAuthLogin: []
  /rest/v1/content/connections/{connection}/fees/{index}:
    delete:
      tags:
      - "Content: Portals"
      summary: "Fee [REMOVE]"
      description: Delete an existing fee
      operationId: deleteFee
      parameters:
      - name: connection
        in: path
        description: 'The ID of the portal connection '
        required: true
        schema:
          type: integer
          format: int64
      - name: index
        in: path
        description: Index of the fee to be deleted
        required: true
        schema:
          type: integer
          format: int32
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: "Internal Server Error, something bad occourend on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      security:
      - OAuthLogin: []
  /rest/v1/content/connections/{connection}/services/{index}:
    delete:
      tags:
      - "Content: Portals"
      summary: "Service [DELETE]"
      description: Delete an existing service
      operationId: deleteService
      parameters:
      - name: connection
        in: path
        description: 'The ID of the portal connection '
        required: true
        schema:
          type: integer
          format: int64
      - name: index
        in: path
        required: true
        schema:
          type: integer
          format: int32
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: "Internal Server Error, something bad occourend on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "202":
          description: "Resource successfully removed, no content provided to client"
      security:
      - OAuthLogin: []
  /rest/v1/content/connections/{connection}/cancellationPolicies:
    get:
      tags:
      - "Content: Portals"
      summary: Cancellation Policies
      description: List current defined cancellation policies
      operationId: getCancellationPolicies
      parameters:
      - name: connection
        in: path
        description: 'The ID of the portal connection '
        required: true
        schema:
          type: integer
          format: int64
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: "Internal Server Error, something bad occourend on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      security:
      - OAuthLogin: []
    post:
      tags:
      - "Content: Portals"
      summary: "Cancellation Policy [ADD]"
      description: Create a new cancellation policy
      operationId: pushCancellationPolicy
      parameters:
      - name: connection
        in: path
        description: 'The ID of the portal connection '
        required: true
        schema:
          type: integer
          format: int64
      - name: policy
        in: query
        description: "External Can. Policy According to previously queried s, the\
          \ portal value to add as policy"
        schema:
          type: string
      - name: ApplyOnDeposit
        in: query
        description: "If true apply only on deposit, if false apply on reservation\
          \ amount"
        schema:
          type: boolean
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: "Internal Server Error, something bad occourend on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      security:
      - OAuthLogin: []
  /rest/v1/content/connections/{connection}/push:
    post:
      tags:
      - "Content: Portals"
      summary: Final Push to Portal
      description: Send the accommodation to the external partner
      operationId: pushAccommodation
      parameters:
      - name: connection
        in: path
        description: 'The ID of the portal connection '
        required: true
        schema:
          type: integer
          format: int64
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: "Internal Server Error, something bad occourend on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      security:
      - OAuthLogin: []
  /rest/v1/content/connections/{connection}/accommodationconf:
    get:
      tags:
      - "Content: Portals"
      summary: Accommodation Settings
      description: "For that specific connection, Retrieve the general Accommodation/Building\
        \ settings"
      operationId: retrieveAccommodationListing
      parameters:
      - name: connection
        in: path
        description: 'The ID of the portal connection '
        required: true
        schema:
          type: integer
          format: int64
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: "Internal Server Error, something bad occourend on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      security:
      - OAuthLogin: []
    post:
      tags:
      - "Content: Portals"
      summary: Accommodation Settings
      description: "For the specific connection, describe the building settings."
      operationId: pushAccommodationConfig
      parameters:
      - name: connection
        in: path
        description: 'The ID of the portal connection '
        required: true
        schema:
          type: integer
          format: int64
      requestBody:
        description: The configuration for this accommodation
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ExternalAccomodation"
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: "Internal Server Error, something bad occourend on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      security:
      - OAuthLogin: []
  /rest/v1/content/connections/{connection}/contacts:
    get:
      tags:
      - "Content: Portals"
      summary: Contacts List
      operationId: retrieveContacts
      parameters:
      - name: connection
        in: path
        description: 'The ID of the portal connection '
        required: true
        schema:
          type: integer
          format: int64
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: "Internal Server Error, something bad occourend on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      security:
      - OAuthLogin: []
    post:
      tags:
      - "Content: Portals"
      description: Contact ADD
      operationId: pushContact
      parameters:
      - name: connection
        in: path
        description: 'The ID of the portal connection '
        required: true
        schema:
          type: integer
          format: int64
      requestBody:
        description: The contact entity to send to the portal
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ExternalContact"
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: "Internal Server Error, something bad occourend on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      security:
      - OAuthLogin: []
  /rest/v1/content/connections/{connection}/extrabeds:
    get:
      tags:
      - "Content: Portals"
      summary: Extra Beds
      description: Retrieve all the inserted Extra beds
      operationId: retrieveExtraBeds
      parameters:
      - name: connection
        in: path
        description: 'The ID of the portal connection '
        required: true
        schema:
          type: integer
          format: int64
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: "Internal Server Error, something bad occourend on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      security:
      - OAuthLogin: []
    post:
      tags:
      - "Content: Portals"
      summary: "Extra Beds [ADD]"
      description: Insert a new Extra Bed
      operationId: pushExtraBed
      parameters:
      - name: connection
        in: path
        description: 'The ID of the portal connection '
        required: true
        schema:
          type: integer
          format: int64
      requestBody:
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ApiExtraBedRequest"
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: "Internal Server Error, something bad occourend on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      security:
      - OAuthLogin: []
  /rest/v1/content/connections/{connection}/fees:
    get:
      tags:
      - "Content: Portals"
      summary: Fees
      description: Retrieve the available external fees
      operationId: retrieveFees
      parameters:
      - name: connection
        in: path
        description: 'The ID of the portal connection '
        required: true
        schema:
          type: integer
          format: int64
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: "Internal Server Error, something bad occourend on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      security:
      - OAuthLogin: []
    post:
      tags:
      - "Content: Portals"
      summary: "Fee [ADD]"
      description: Create a new Fee
      operationId: pushFee
      parameters:
      - name: connection
        in: path
        description: 'The ID of the portal connection '
        required: true
        schema:
          type: integer
          format: int64
      requestBody:
        description: The new Api Fee Request
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ApiFeeRequest"
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: "Internal Server Error, something bad occourend on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      security:
      - OAuthLogin: []
  /rest/v1/content/connections/{connection}/rentalagreement:
    post:
      tags:
      - "Content: Portals"
      summary: Rental Agreement
      description: Upload the rental agreement. MAX 5 MB
      operationId: pushRental
      parameters:
      - name: connection
        in: path
        required: true
        schema:
          type: integer
          format: int64
      - name: url
        in: query
        schema:
          type: string
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: "Internal Server Error, something bad occourend on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      security:
      - OAuthLogin: []
  /rest/v1/content/connections/{connection}/services:
    get:
      tags:
      - "Content: Portals"
      summary: Services
      description: Retrieve the list of services for that accommodation
      operationId: retrieveServices
      parameters:
      - name: connection
        in: path
        description: 'The ID of the portal connection '
        required: true
        schema:
          type: integer
          format: int64
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: "Internal Server Error, something bad occourend on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      security:
      - OAuthLogin: []
    post:
      tags:
      - "Content: Portals"
      summary: "Service [ADD]"
      description: Add new service
      operationId: pushService
      parameters:
      - name: connection
        in: path
        description: 'The ID of the portal connection '
        required: true
        schema:
          type: integer
          format: int64
      requestBody:
        description: The content of the service
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ExternalService"
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: "Internal Server Error, something bad occourend on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      security:
      - OAuthLogin: []
  /rest/v1/content/connections/{connection}/extrabeds/{index}:
    delete:
      tags:
      - "Content: Portals"
      summary: "Extra Beds [DELETE]"
      description: "Remove an extra bed, using his index"
      operationId: removeBed
      parameters:
      - name: connection
        in: path
        description: 'The ID of the portal connection '
        required: true
        schema:
          type: integer
          format: int64
      - name: index
        in: path
        required: true
        schema:
          type: integer
          format: int32
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: "Internal Server Error, something bad occourend on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      security:
      - OAuthLogin: []
  /rest/v1/content/connections/meta/{portal}:
    get:
      tags:
      - "Content: Portals"
      summary: Read Static Portal meta
      description: Retrieve all the possible META custom data for a portal
      operationId: retrieveMetaPortal
      parameters:
      - name: portal
        in: path
        required: true
        schema:
          type: string
      - name: category
        in: query
        description: "Repetable, optional, category filter"
        schema:
          type: array
          items:
            type: string
            enum:
            - FEE_PERSONAL
            - CHARGE_TYPE
            - IMAGE_TAGS
            - SERVICE
            - PAYMENTS_CARD
            - LANGUAGES
            - BREAKFAST
            - CANCEL_POLICY
            - ROOM_AMENITY
            - INTERNET_CONNECTION_TYPES
            - INTERNET_CONNECTION_COVERAGE
            - PARKING_TYPE
            - BED_TYPE
            - CONTACT_TYPE
            - CONTACT_LANGUAGE
            - EXTRABED_GUEST_TYPE
            - BOOKING_ACCEPTED_GUESTS
            - FEE_TAX
            - RATE_OFFER
            - PRODUCT_BENEFIT
            - ACCOMMODATION_CATEGORY
            - CITY_TAX_CATEGORY
            - CITY_TAX_NATURE
            - CANCEL_POLICY_DEPOSIT
            - ROOM_CATEGORY
            - ROOM_CLASS
            - BEDROOM_TYPE
            - ROOM_NAMING
            - PHOTO_TYPE
            - LISTING_EXPECTATION
            - PROPERTY_CHECKIN_METHOD
            - BATHROOM_LOCATION
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: "Internal Server Error, something bad occourend on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      security:
      - OAuthLogin: []
  /rest/v1/policies/{accommodation}:
    get:
      tags:
      - "Property: Cancellation policies"
      summary: Retrieve Cancellation and Payment Policies
      description: Through this call you can retrieve all the Policies set in the
        Octorate Platform. <br/>
      externalDocs:
        description: Guide for automatic takings
        url: https://community.octorate.com/post/scheduled-takings-5ea92fa2f0cbae424ee516a3
      operationId: getPolicies
      parameters:
      - name: accommodation
        in: path
        required: true
        schema:
          type: string
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "500":
          description: "Internal Server Error, something bad occourend on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: Processed
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/ApiPaymentStepDTO"
              example:
                data:
                - id: 1932
                  stepType: PAYMENT
                  title: Bank cash
                - id: 8718
                  stepType: PAYMENT
                  title: test money
                - id: 11450
                  stepType: PAYMENT
                  title: "30 Days Before, take money"
                - id: 11451
                  stepType: PAYMENT
                  title: saldo
                - id: 4478
                  stepType: CANCELLATION
                  title: 50% - 10 days prior to checkin
  /rest/v1/connection/{accommodation}:
    post:
      tags:
      - "Property: Portal Connections"
      summary: Create new connection
      description: "Link an existing portal to this account. This operation will check\
        \ that you have specified which portals you want to connect, if the user has\
        \ the licence, and if the credentials are set. In case of multiaccount, if\
        \ the credentials are missing, it will also try to retrieve them from another\
        \ connection/property"
      operationId: createConnection
      parameters:
      - name: accommodation
        in: path
        required: true
        schema:
          type: string
      requestBody:
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ApiConnectionDTO"
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "500":
          description: "Internal Server Error, something bad occurred on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ApiConnectionDTO"
      security:
      - OAuthLogin: []
  /rest/v1/connection/external/{accommodation}/{connection}:
    get:
      tags:
      - "Property: Portal Connections"
      summary: Retrieve external products
      description: List (and related ids) of the external portal products
      operationId: getExternalProducts
      parameters:
      - name: accommodation
        in: path
        description: Accommodation Id
        required: true
        schema:
          type: string
      - name: connection
        in: path
        description: Connection Id
        required: true
        schema:
          type: integer
          format: int64
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "500":
          description: "Internal Server Error, something bad occurred on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/ApiExternalRoomDTO"
              examples:
                example of response:
                  description: example of response
                  value:
                    data:
                    - createTime: "2018-11-22T11:13:00Z[UTC]"
                      id: 523833
                      manageable: true
                      occupancy: 4
                      pmsRoom: false
                      rateId: "3101"
                      rateName: Not Refundable without breakfast
                      referenceId: 3758:3101
                      roomId: "3758"
                      roomName: Appartamento la Torretta per 4 persone
      security:
      - OAuthLogin: []
      - OAuthLogin:
        - api_connection_read
    post:
      tags:
      - "Property: Portal Connections"
      summary: Create an external product
      description: "A combination of Room and Rate compose a Product. <br/>For the\
        \ ARI Octorate process only products so combination of room + rate. Normally\
        \ we suggest you to not use this method but use the method to import them\
        \ directly from the portal. <br/>This method is usefull for the API user that\
        \ handles also the <b>OTAs</b> when themself are otas. In this case you can\
        \ create the same products you have on your site (i.e. the listing or the\
        \ room+rate item) Inside Octorate, to let Octorate know what's your id.We\
        \ will provide them in Content Push updates or ARI (Availability and rates\
        \ inventory) Updates. <br/>Please, remember after to associate them to the\
        \ Octorate Product through the mapping method. <br/>If you want, you can also\
        \ ask the user to do the mapping on our interface. "
      operationId: createExternalProduct
      parameters:
      - name: accommodation
        in: path
        required: true
        schema:
          type: string
          description: Accommodation Id
      - name: connection
        in: path
        required: true
        schema:
          type: integer
          description: Connection Id
          format: int64
      requestBody:
        content:
          '*/*':
            schema:
              $ref: "#/components/schemas/ApiExternalRoomDTO"
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "500":
          description: "Internal Server Error, something bad occurred on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      security:
      - OAuthLogin: []
  /rest/v1/connection/{accommodation}/{connection}:
    delete:
      tags:
      - "Property: Portal Connections"
      summary: Delete Connection
      description: "Delete a portal connection. Keep care: Remember that you might\
        \ need to erase the mapping"
      operationId: deleteConnection
      parameters:
      - name: accommodation
        in: path
        description: Accommodation Id
        required: true
        schema:
          type: string
      - name: connection
        in: path
        description: Connection Id
        required: true
        schema:
          type: integer
          format: int64
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "500":
          description: "Internal Server Error, something bad occurred on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ApiConnectionDTO"
      security:
      - OAuthLogin: []
    patch:
      tags:
      - "Property: Portal Connections"
      summary: Update a connection
      description: "Update a connection updating only the specified fields. Validation\
        \ is performed against license, and activable connection (login, mapping,etc...)"
      operationId: updateConnection
      parameters:
      - name: accommodation
        in: path
        required: true
        schema:
          type: string
      - name: connection
        in: path
        required: true
        schema:
          type: integer
          format: int64
      requestBody:
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ApiConnectionDTO"
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "500":
          description: "Internal Server Error, something bad occurred on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ApiConnectionDTO"
        "304":
          description: "Not Modified (empty response): Indicates the resource has\
            \ not been modified since last requested.. Using this saves bandwidth\
            \ and reprocessing on both the server and client, as only the header data\
            \ must be sent and received in comparison to the entirety of the page\
            \ being re-processed by the server, then sent again using more bandwidth\
            \ of the server and client."
      security:
      - OAuthLogin: []
  /rest/v1/connection/mapping/{accommodation}/{connection}/{mappingId}:
    delete:
      tags:
      - "Property: Portal Connections"
      description: Delete an existing mapping
      operationId: deleteMapping
      parameters:
      - name: accommodation
        in: path
        description: Accommodation Id
        required: true
        schema:
          type: string
      - name: connection
        in: path
        description: Connection Id
        required: true
        schema:
          type: integer
          format: int64
      - name: mappingId
        in: path
        description: Mapping id retrieved from the previous connection
        required: true
        schema:
          type: integer
          format: int64
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "500":
          description: "Internal Server Error, something bad occurred on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
      security:
      - OAuthLogin: []
  /rest/v1/connection/{action}/{accommodation}/{connection}:
    post:
      tags:
      - "Property: Portal Connections"
      summary: Execute ACTION on connection
      description: This API method executes one of the following actions on the connection
        id (the portal connection of one property) provided..
      operationId: executeAction
      parameters:
      - name: accommodation
        in: path
        required: true
        schema:
          type: string
          description: Property ID
      - name: connection
        in: path
        required: true
        schema:
          type: integer
          description: "Connection ID of the connection created on the accommodation.\
            \ If you don't have one, look for 'Create new connection'"
          format: int64
      - name: action
        in: path
        required: true
        schema:
          type: string
          description: "Email Help to Customer = Send the welcome mail to customer\
            \ <br/> Import rooms = Import the rooms from the external channel, ready\
            \ to be mapped <br/> Import calendar = Import the calendar inside Octorate\
            \ <br/> Mark connect = Notify to Octorate and if needed to the external\
            \ channel that this connection is ready <br/> Import Room Pms: If this\
            \ channel is able to give PMS rooms, import them <br/> Import resa: Import\
            \ future reservations inside Octorate."
          enum:
          - EMAIL_HELP_CUSTOMER
          - IMPORT_ROOMS
          - IMPORT_RESERVATIONS
          - IMPORT_CALENDAR
          - MARK_CONNECTED
          - IMPORT_ROOMS_PMS
          - IMPORT_RESA_DECREMENT_AVAIL
          - COMMIT_MAPPING_AS_COMPLETED
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "500":
          description: "Internal Server Error, something bad occurred on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/ApiMapping"
              examples:
                Response of method 'IMPORT ROOMS':
                  description: Response of method 'IMPORT ROOMS'
                  value:
                    additionalInfo:
                      actionPerformed: IMPORT_ROOMS
                      connectionId: 82043
                      prepertyId: "955809"
                      apiId: 121
                      time: "2021-04-27T12:20:22.634Z[UTC]"
                    data:
                    - externalId: 1154454
                      id: 536429
                      portalConnection: 82043
                      productId: 376539
        "550":
          description: "Internal Server Error, something bad occurred on the EXTERNAL\
            \ site"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      security:
      - OAuthLogin: []
  /rest/v1/connection/mapping/{accommodation}/{connection}:
    get:
      tags:
      - "Property: Portal Connections"
      summary: Retrieve Mapping
      description: List mapping of the connections between Octorate products to related
        external products
      operationId: getMapping
      parameters:
      - name: connection
        in: path
        required: true
        schema:
          type: integer
          format: int64
      - name: accommodation
        in: path
        required: true
        schema:
          type: string
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "500":
          description: "Internal Server Error, something bad occurred on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/ApiMapping"
              examples:
                Example of result:
                  description: Example of result
                  value:
                    data:
                    - externalId: 523812
                      id: 262466
                      portalConnection: 41683
                      productId: 2262
      security:
      - OAuthLogin: []
    post:
      tags:
      - "Property: Portal Connections"
      summary: Create Mapping
      description: Create a new connection between an external product and an Octorate
        product. We expect to always have an external item even though the ota doesn't
        require it because we will push prices only for connected sites.
      operationId: pushMapping
      parameters:
      - name: accommodation
        in: path
        description: Accommodation Id
        required: true
        schema:
          type: string
      - name: connection
        in: path
        description: Connection Id
        required: true
        schema:
          type: integer
          format: int64
      - name: product
        in: query
        description: Internal product (room or rates) of Octorate
        required: true
        schema:
          type: integer
          format: int64
      - name: externalProduct
        in: query
        description: External Product (id taken by previous call)
        required: true
        schema:
          type: integer
          format: int64
      - name: query
        in: query
        description: "As alternative to externalProduct, Octorate Api can try to lookup\
          \ from the roomrate code (i.e. room:rate@@1)"
        schema:
          type: string
      requestBody:
        description: You can also specify product and external as json value
        content:
          '*/*':
            schema:
              type: string
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "500":
          description: "Internal Server Error, something bad occurred on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ApiMapping"
              examples:
                Example of result:
                  description: Example of result
                  value:
                    externalId: 523812
                    id: 262466
                    portalConnection: 41683
                    productId: 2262
      security:
      - OAuthLogin: []
  /rest/v1/connection:
    get:
      tags:
      - "Property: Portal Connections"
      summary: Retrieve a connection ID
      operationId: retrieveConnectionDetail
      parameters:
      - name: name
        in: query
        description: Optional name (like) to restrict the search
        schema:
          type: string
      - name: accommodation
        in: query
        schema:
          type: string
      - name: hotelId
        in: query
        schema:
          type: string
      - name: "id[]"
        in: query
        description: Optional list of ids (repeat the query param for many) to restrict
          the search
        schema:
          type: array
          items:
            type: integer
            format: int64
      - name: fields
        in: query
        description: "List of fields to filter in the response. Can be usefull to\
          \ save bandwith and get quicker response from this server. Values are separated\
          \ by comma, only applies to the first level, like this: 'channelName,channelId,id'"
        schema:
          type: string
        example: "channelName,channelId,id"
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "500":
          description: "Internal Server Error, something bad occurred on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
      security:
      - OAuthLogin: []
  /rest/v1/extra/bulk/{accommodation}:
    post:
      tags:
      - "Property: Extra/Products"
      description: Create new Extra Products
      operationId: createExtraProducts
      parameters:
      - name: accommodation
        in: path
        required: true
        schema:
          type: string
      requestBody:
        description: The Product to create
        content:
          application/json:
            schema:
              type: array
              items:
                $ref: "#/components/schemas/ApiExtraProduct"
            examples:
              Example of Request:
                description: Example of Request
                value:
                  data:
                  - model: WEEK
                    name: dolor ex dolor m
                    enabled: false
                    mandatory: false
                    refundable: false
                    basePrice: 20
                    taxPercent: 10
                    description:
                      EN: These are the LanguageMap value in English!
                    title:
                      EN: These are the LanguageMap value in English!
        required: true
      responses:
        "200":
          description: Extra Product Created
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ApiExtraProduct"
  /rest/v1/extra/{accommodation}/{productId}:
    put:
      tags:
      - "Property: Extra/Products"
      summary: Update a product
      description: Update a product inside Octorate. You can set as active or not
        a product here
      operationId: updateExtraProduct
      parameters:
      - name: accommodation
        in: path
        required: true
        schema:
          type: string
      - name: productId
        in: path
        required: true
        schema:
          type: integer
          format: int64
      requestBody:
        description: The Product to create
        required: true
      responses:
        "200":
          description: Product updated
          content:
            '*/*':
              schema:
                $ref: "#/components/schemas/ApiExtraProduct"
        "304":
          description: "Not Modified: Property not updated because the content is\
            \ equals to octorate content or empty mandatory fields was skipped. NO\
            \ CONTENT is provided in this case"
    delete:
      tags:
      - "Property: Extra/Products"
      summary: Delete a product
      description: Delete a product inside Octorate. You can set as active or not
        a product here
      operationId: deleteExtraProduct
      parameters:
      - name: accommodation
        in: path
        required: true
        schema:
          type: string
      - name: productId
        in: path
        required: true
        schema:
          type: integer
          format: int64
      responses:
        "200":
          description: Product updated
          content:
            '*/*':
              schema:
                $ref: "#/components/schemas/ApiExtraProduct"
  /rest/v1/extra/{accommodation}:
    get:
      tags:
      - "Property: Extra/Products"
      description: Retrieve all the existing extras products
      operationId: findExtras
      parameters:
      - name: accommodation
        in: path
        required: true
        schema:
          type: string
      - name: id
        in: query
        description: Filter by specific id
        schema:
          type: integer
          format: int64
      - name: sortBy
        in: query
        description: "Sort by field, for instance, name.asc. Possible values are [name|price|priority].[asc|desc]"
        schema:
          type: string
      - name: enabled
        in: query
        description: Filter only the enabled extras
        schema:
          type: boolean
      - name: name
        in: query
        description: Filter the extras by name
        schema:
          type: string
      - name: extraCategoryId
        in: query
        description: Filter the extras by category
        schema:
          type: integer
          format: int64
      - name: includeGeneratedExtra
        in: query
        description: Filter the generated extras
        schema:
          type: boolean
          default: true
      - name: includeMasterAccommodationExtras
        in: query
        description: Filter the master accommodation extras
        schema:
          type: boolean
          default: true
      - name: "accommodations[]"
        in: query
        description: Return payment steps belonging to the specified accommodations
        schema:
          type: array
          items:
            type: string
      - name: fields
        in: query
        description: "List of fields to filter in the response. Can be usefull to\
          \ save bandwith and get quicker response from this server. Values are separated\
          \ by comma, only applies to the first level, like this: 'checkin, guests'"
        schema:
          type: string
      - name: size
        in: query
        description: 'How many results per page? '
        schema:
          maximum: 200
          minimum: 1
          type: integer
          format: int32
          default: 20
      - name: page
        in: query
        description: Page number of the results
        schema:
          maximum: 1000
          minimum: 0
          type: integer
          format: int32
      responses:
        "200":
          description: Response correctly processed
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/ApiExtraProduct"
              examples:
                Example of list of items:
                  description: Example of list of items
                  value:
                    data:
                    - id: 200043
                      name: IVA
                      accommodation:
                        currency: EUR
                        id: "112696"
                        name: La Pergola di Venezia
                        timeZone: Europe/Rome
                      enabled: true
                      mandatory: false
                      refundable: false
                      basePrice: 0.0
                      description: {}
                      model: BOOKING
                      taxPercent: 0.0
                      title: {}
                    - id: 200044
                      name: Tassa di soggiorno
                      accommodation:
                        currency: EUR
                        id: "112696"
                        name: La Pergola di Venezia
                        timeZone: Europe/Rome
                      enabled: true
                      mandatory: false
                      refundable: false
                      basePrice: 0.0
                      description: {}
                      model: BOOKING
                      taxPercent: 0.0
                      title: {}
  /rest/v1/extra/{accommodation}/updateAll:
    put:
      tags:
      - "Property: Extra/Products"
      summary: Update All Extra products
      description: 'Update many extra products in the accommodation. '
      operationId: updateExtraProductBulk
      parameters:
      - name: accommodation
        in: path
        required: true
        schema:
          type: string
      requestBody:
        description: The Product to create
        required: true
      responses:
        "200":
          description: Products updated
          content:
            '*/*':
              schema:
                $ref: "#/components/schemas/ApiExtraProduct"
  /rest/v1/rateplans/{accommodation}/{id}:
    put:
      tags:
      - "ARI: RatePlan Info"
      description: Update a rate plan
      operationId: updateRatePlan
      parameters:
      - name: accommodation
        in: path
        required: true
        schema:
          type: string
      - name: id
        in: path
        description: Rate plan ID
        required: true
        schema:
          type: integer
          format: int64
      requestBody:
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ApiRateDTO"
      responses:
        default:
          description: default response
          content:
            application/json: {}
    delete:
      tags:
      - "ARI: RatePlan Info"
      description: Delete a rate plan
      operationId: deleteRatePlan
      parameters:
      - name: accommodation
        in: path
        required: true
        schema:
          type: string
      - name: id
        in: path
        description: Rate plan ID
        required: true
        schema:
          type: integer
          format: int64
      responses:
        default:
          description: default response
          content:
            application/json: {}
  /rest/v1/rateplans/{accommodation}:
    get:
      tags:
      - "ARI: RatePlan Info"
      summary: Retrieve the rate plans labels
      description: These are the available rate plans
      operationId: getRatePlans
      parameters:
      - name: accommodation
        in: path
        required: true
        schema:
          type: string
      - name: checkMultiaccount
        in: query
        schema:
          type: boolean
      - name: fields
        in: query
        schema:
          type: string
      - name: "ids[]"
        in: query
        schema:
          type: array
          items:
            type: integer
            format: int64
      responses:
        "200":
          description: Processed
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/ApiRateDTO"
    post:
      tags:
      - "ARI: RatePlan Info"
      description: Update a rate plan
      operationId: saveRatePlan
      parameters:
      - name: accommodation
        in: path
        required: true
        schema:
          type: string
      requestBody:
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ApiRateDTO"
      responses:
        default:
          description: default response
          content:
            application/json: {}
  /rest/v1/identity/migrate:
    post:
      tags:
      - "Auth: Identities"
      summary: Migrate Old
      description: "Migrate the old Api Key to a new Access + Refresh Token. Can be\
        \ execute once, it will NOT invalidate your api key for the old api system.\
        \ This method will give you one token per property."
      operationId: migrateApiKey
      parameters:
      - name: key
        in: header
        schema:
          type: string
      requestBody:
        content:
          application/x-www-form-urlencoded:
            schema:
              type: object
              properties:
                accommodation:
                  type: string
      responses:
        default:
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/OAuthToken2"
      security:
      - Key: []
  /rest/v1/identity/refresh:
    post:
      tags:
      - "Auth: Identities"
      description: "Refresh the current token. General Usage: All methods that have\
        \ the properties inside or something related to a property."
      operationId: refresh
      requestBody:
        content:
          application/x-www-form-urlencoded:
            schema:
              type: object
              properties:
                client_id:
                  type: string
                  description: The client_id is a public identifier for apps
                client_secret:
                  type: string
                refresh_token:
                  type: string
                  description: The previously granted refresh token. If you don't
                    know what's this or where recover it check the authentication
                    tutorial
                notes:
                  type: string
      responses:
        "200":
          description: Token issued
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/OAuthToken2"
              examples:
                Response 200:
                  description: Response 200
                  value:
                    access_token: 01a83320-1c11-42f4-ab8e-8dd3d98af1132d7846ec-bd32-4b51-9a49-d394202bbb30
                    expireDate: 2020-06-17T10:22:30Z
        "400":
          description: Request is made wrongly
        "403":
          description: Access Denied. Access to the resource denied
  /rest/v1/identity/token:
    post:
      tags:
      - "Auth: Identities"
      summary: Properties Token
      description: "General Usage: Allow connection for existing octorate customers.\
        \ <br/> This method interest you if you want to access the data of the properties.\
        \ So reading reservations, writing new rooms, and reading content are part\
        \ of this authentication scheme.  In this case the authentication is granular\
        \ and for each user. We expect that the single user gives you the authorization\
        \ to proceed. In case you're creating a new property you don't need this api\
        \ method but you will find it inside the response of created accommodation.<br/>We\
        \ expect that the user has granted the authorization to proceed to connect\
        \ your api.<br/>After that we have redirect the user back to your site (Redirect_uri)\
        \ appending as url param the value code. <br/>Consume here the previously\
        \ provided one shoot grant and retrieve the token. You have 3 minutes to consume\
        \ the grant after you will have to ask again the authorization"
      externalDocs:
        description: Authentication process. Check this argument deeper
        url: /connect/showcases/authentication.html
      operationId: token
      requestBody:
        content:
          application/x-www-form-urlencoded:
            schema:
              required:
              - client_id
              - client_secret
              - code
              - grant_type
              - redirect_uri
              type: object
              properties:
                client_id:
                  type: string
                  description: The client_id is a public identifier for apps
                client_secret:
                  type: string
                  description: The client_secret is a secret known only to the application
                    and octorate It is critical that developers never include their
                    client_secret in public (mobile or browser-based) apps.
                code:
                  type: string
                  description: "Once the user has been redirect back to your site,\
                    \ you will find this param in the url (GET PARAMS). Please at\
                    \ this stage use 'code''"
                redirect_uri:
                  type: string
                  description: Should be whitelisted by octorate. Use always the same
                    through the same flow
                code_challenge:
                  type: string
                  description: Used as alternative to client_secret when the application
                    is a Single Page Application and does not have a backend
                grant_type:
                  type: string
                  description: please use 'code'
                  default: code
      responses:
        "200":
          description: Token issued
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/OAuthToken2"
        "400":
          description: Request is made wrongly
        "403":
          description: Access Denied. Access to the resource denied
  /rest/v1/checkin/{accommodation}/{reservationId}/guest/{guestId}:
    put:
      tags:
      - "Property: Checkins"
      description: Update an existing guest inside the reservation. Guest here is
        the detailed information retrieved during the checkin and usually send to
        police
      operationId: updateGuest
      parameters:
      - name: reservationId
        in: path
        description: Reservation ID (Octorate ID) where update guests
        required: true
        schema:
          type: integer
          format: int64
      - name: accommodation
        in: path
        description: Property ID (Octorate ID)
        required: true
        schema:
          type: string
      - name: guestId
        in: path
        description: Guest ID. The id obtained from the GET reservation call OR the
          guest id
        required: true
        schema:
          type: integer
          format: int64
      requestBody:
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ApiReservationGuestDTO"
      responses:
        "200":
          description: Sucess
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ApiReservationGuestDTO"
    delete:
      tags:
      - "Property: Checkins"
      description: Delete a guest of the reservation
      operationId: deleteGuest
      parameters:
      - name: reservationId
        in: path
        description: Reservation ID (Octorate ID) where update guests
        required: true
        schema:
          type: integer
          format: int64
      - name: accommodation
        in: path
        description: Property ID (Octorate ID)
        required: true
        schema:
          type: string
      - name: guestId
        in: path
        description: Guest ID. The id obtained from the GET reservation call OR the
          guest id
        required: true
        schema:
          type: integer
          format: int64
      responses:
        "200":
          description: Sucess
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ApiReservationGuestDTO"
  /rest/v1/checkin/{accommodation}/{reservationId}:
    put:
      tags:
      - "Property: Checkins"
      description: "Update the general status of the reservation as checked in, checked\
        \ out or no show."
      operationId: Checkin/out Status
      parameters:
      - name: reservationId
        in: path
        description: Reservation ID (Octorate ID) where update guests
        required: true
        schema:
          type: integer
          format: int64
      - name: accommodation
        in: path
        description: Property ID (Octorate ID)
        required: true
        schema:
          type: string
      - name: status
        in: query
        schema:
          type: string
          enum:
          - CHECKIN_END
          - CHECKOUT_END
          - NO_SHOW
      responses:
        "200":
          description: Success (Empty response)
  /rest/v1/guests/{accommodationId}/{guestId}:
    get:
      tags:
      - "Property: Guests"
      description: Retrieve the guest with the provided id
      operationId: getById
      parameters:
      - name: accommodationId
        in: path
        required: true
        schema:
          type: string
      - name: guestId
        in: path
        required: true
        schema:
          type: integer
          format: int64
      responses:
        "200":
          description: Processed
        "403":
          description: Access Denied. Access to the resource denied
        "500":
          description: Internal Server Error
    put:
      tags:
      - "Property: Guests"
      description: Update an existing Guest
      operationId: update
      parameters:
      - name: accommodationId
        in: path
        required: true
        schema:
          type: string
      - name: guestId
        in: path
        required: true
        schema:
          type: integer
          format: int64
      responses:
        default:
          description: default response
          content:
            application/json: {}
  /rest/v1/guests/{accommodationId}/list:
    get:
      tags:
      - "Property: Guests"
      description: Retrieve the guests according to the provided filters
      operationId: getList
      parameters:
      - name: accommodationId
        in: path
        required: true
        schema:
          type: string
      - name: "categories[]"
        in: query
        schema:
          uniqueItems: true
          type: array
          items:
            type: string
            enum:
            - INDIVIDUAL
            - TRAVEL_AGENCY
            - CORPORATE
            - EXTERNAL_OTA
      - name: guestName
        in: query
        schema:
          type: string
      - name: fields
        in: query
        description: "List of fields to filter in the response. Can be usefull to\
          \ save bandwith and get quicker response from this server. Values are separated\
          \ by comma, only applies to the first level, like this: 'checkin, guests'"
        schema:
          type: string
      - name: size
        in: query
        description: 'How many results per page? '
        schema:
          maximum: 200
          minimum: 1
          type: integer
          format: int32
          default: 20
      - name: page
        in: query
        description: Page number of the results
        schema:
          maximum: 1000
          minimum: 0
          type: integer
          format: int32
      responses:
        "200":
          description: Processed
        "403":
          description: Access Denied. Access to the resource denied
        "500":
          description: Internal Server Error
  /rest/v1/guests/{accommodationId}:
    post:
      tags:
      - "Property: Guests"
      description: Insert a new Guest
      operationId: insert
      parameters:
      - name: accommodationId
        in: path
        required: true
        schema:
          type: string
      responses:
        "200":
          description: Processed
        "403":
          description: Access Denied. Access to the resource denied
        "500":
          description: Internal Server Error
  /rest/v1/payment/OCTORATE/{otaName}/addCard:
    post:
      tags:
      - "Property: Payments"
      summary: Add Card
      description: "We're PCI compliant. This means that in case you need to add a\
        \ new card to a reservation we ask you to communicate the details to a specific\
        \ partner and NOT to our endpoint. If you need this option, please contact\
        \ us in order to prepare the necessary staff. <br/> Anyway here there are\
        \ some of the details of the call you will do to our partner. It's in the\
        \ same format of the others APIs.  You still need to provide the token to\
        \ access the property. Prepare a fallback scenario in case Octorate or our\
        \ partner replies with an error. As response you will get the updated reservation\
        \ with the credit card details. Please prepare a scenario to resend the card\
        \ if the connection to us is not available."
      operationId: addCard
      parameters:
      - name: otaName
        in: path
        required: true
        schema:
          type: string
      requestBody:
        content:
          application/json:
            schema:
              type: string
      responses:
        "200":
          description: Card Registered (Detail of reservation provided back)
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ApiReservationRespDTO"
        "404":
          description: Reservation not found
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ApiError"
        "403":
          description: Attempt to send card details directly to Octorate (can't be
            done due PCI regulations)
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ApiError"
        "500":
          description: Octorate / Partner server error
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ApiError"
      security:
      - OAuthLogin:
        - api_write_reservation
        - api_card_write
      servers:
      - url: https://ourSecretCreditCards.something/
        description: 3rd partner tokenization endpoint
  /rest/v1/payment/{propertyId}/register:
    get:
      tags:
      - "Property: Payments"
      summary: Card PIN Status
      description: Check if the given property is allowed to see credit cards
      operationId: getUserStatus
      parameters:
      - name: propertyId
        in: path
        required: true
        schema:
          type: string
          description: The Property ID
          example: "16997"
      - name: copyNetwork
        in: query
        schema:
          type: boolean
          description: "Set TRUE to copy on each child accommodation, if you don't\
            \ know we suggest set true"
      responses:
        "200":
          description: Status of the request
          content:
            application/json:
              example:
                status: active
        "500":
          description: Octorate / Partner server error
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ApiError"
      security:
      - OAuthLogin:
        - api_read_accommodation
    post:
      tags:
      - "Property: Payments"
      summary: Register Card PIN
      description: "Allow the final guest to handle the credit card, take care: We\
        \ will send an email and SMS to the email/telephone registered inside the\
        \ accommodation. Make sure these value are right. In case of multi-property\
        \ account, we suggest you to send the request for the main account, when you\
        \ will check the status, we will copy the user to the other accommodations."
      operationId: createUser
      parameters:
      - name: propertyId
        in: path
        required: true
        schema:
          type: string
          description: Property ID that have set mobile phone and email
      responses:
        "200":
          description: Request has been start
          content:
            application/json:
              example:
                status: wait
        "400":
          description: "Bad Request, response given in case the params or the configuration\
            \ of the property is not valid"
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ApiError"
        "500":
          description: Octorate / Partner server error
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ApiError"
      security:
      - OAuthLogin:
        - api_write_accommodation
  /rest/v1/payment/{accommodationId}/{paymentId}:
    delete:
      tags:
      - "Property: Payments"
      description: Delete the payment with the provided id
      operationId: delete
      parameters:
      - name: accommodationId
        in: path
        required: true
        schema:
          type: string
      - name: paymentId
        in: path
        required: true
        schema:
          type: integer
          format: int64
      responses:
        "200":
          description: Processed
        "403":
          description: Access Denied. Access to the resource denied
        "500":
          description: Internal Server Error
  /rest/v1/payment/{reservationId}/detokenize:
    get:
      tags:
      - "Property: Payments"
      summary: Detokenize/Show Card
      description: Ask Octorate to give you the link to see the credit card
      operationId: detokenize
      parameters:
      - name: reservationId
        in: path
        required: true
        schema:
          type: integer
          description: The reservation ID
          format: int64
      - name: language
        in: query
        schema:
          type: string
          description: The language of the credit card page
          enum:
          - IT
          - EN
          - FR
          - ES
          - DE
          - RU
          - PT
          - NL
          - JA
          - EL
          - TR
          - ZH
          - CA
          - RO
      - name: askCvv
        in: query
        schema:
          type: boolean
          description: Set true to ask also the visualization of the CVV
      responses:
        "200":
          description: Card details
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ApiReservationCard"
        "500":
          description: Octorate / Partner server error
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ApiError"
      security:
      - OAuthLogin:
        - api_card_read
  /rest/v1/payment/{accommodationId}/{paymentId}/move:
    patch:
      tags:
      - "Property: Payments"
      description: Move the payment with the provided id to the reservation with the
        provided id
      operationId: move
      parameters:
      - name: accommodationId
        in: path
        required: true
        schema:
          type: string
      - name: paymentId
        in: path
        required: true
        schema:
          type: integer
          format: int64
      - name: reservationId
        in: query
        schema:
          type: integer
          format: int64
      responses:
        "200":
          description: Processed
        "403":
          description: Access Denied. Access to the resource denied
        "500":
          description: Internal Server Error
  /rest/v1/reservation/{accommodation}/{id}/extras:
    post:
      tags:
      - "Property: Reservations"
      description: Add to an existing reservation the list of the extra provided.
      operationId: addExtraBulkReservation
      parameters:
      - name: id
        in: path
        description: Reservation ID (Octorate ID)
        required: true
        schema:
          type: integer
          format: int64
      - name: accommodation
        in: path
        description: Property ID (Octorate ID)
        required: true
        schema:
          type: string
      requestBody:
        description: List of extras to add
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ApiExtras"
            examples:
              Example:
                description: Example
                value:
                  extras:
                  - product: 196998
                    price: 20
                    quantity: 1
        required: true
      responses:
        "200":
          description: Default response
          content:
            application/json:
              example:
                data:
                - product: 196998
                  price: 0
                  quantity: 3
                - product: 196998
                  price: 0
                  quantity: 7
                page:
                  page: 1
                  totalPages: 1
  /rest/v1/reservation/{accommodation}/{id}/payment:
    post:
      tags:
      - "Property: Reservations"
      description: Add a payment to the reservation. This is not the credit card debit
      operationId: addPaymentReservation
      parameters:
      - name: id
        in: path
        description: Reservation ID (Octorate ID)
        required: true
        schema:
          type: integer
          format: int64
      - name: accommodation
        in: path
        description: Property ID (Octorate ID)
        required: true
        schema:
          type: string
      requestBody:
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ApiReservationPaymentDTO"
      responses:
        default:
          description: default response
          content:
            application/json: {}
  /rest/v1/reservation/bulk/{accommodation}:
    post:
      tags:
      - "Property: Reservations"
      description: Create Bulk reservations
      operationId: createManyReservations
      parameters:
      - name: accommodation
        in: path
        required: true
        schema:
          type: string
      requestBody:
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ApiBulkReservation"
      responses:
        default:
          description: default response
          content:
            application/json: {}
  /rest/v1/reservation/{accommodation}:
    get:
      tags:
      - "Property: Reservations"
      summary: findReservations
      description: Retrieve all the existing reservations reservation.
      operationId: findReservations
      parameters:
      - name: accommodation
        in: path
        description: Property id
        required: true
        schema:
          type: string
          example: "112696"
      - name: "ids[]"
        in: query
        description: List of IDs of specific reservations. The search is exclusive
          in this case
        schema:
          type: array
          items:
            type: integer
            format: int64
      - name: product
        in: query
        description: Filter by a typology or rate (product). Put here the ID
        schema:
          type: integer
          format: int64
      - name: "products[]"
        in: query
        description: Filter by a typology or rate (product). Put here the ID
        schema:
          type: array
          items:
            type: integer
            format: int64
      - name: pms
        in: query
        description: pms
        schema:
          type: boolean
      - name: pmsProduct
        in: query
        description: "Filter by a Pms Room (ID), like 102,103,104. Blue room, etc..."
        schema:
          type: integer
          format: int64
      - name: source
        in: query
        description: Filter by a portal
        schema:
          type: string
      - name: status
        in: query
        description: Filter by status
        schema:
          type: string
          enum:
          - CANCELLED
          - WAITING
          - CONFIRMED
          - ACTIVE
          - NOROOM
          - COMPLETED
          - NOCOMPLETED
          - NEWMESSAGE
          - EXPIREDMESSAGE
          - PROPOSAL
          - PROPOSAL_EXPIRED
          - NOT_INVOICED
          - DEPOSIT_NOT_MANAGED
          - DEPOSIT_IN_WAITING
          - TO_REVIEW
      - name: excludedSources
        in: query
        description: Comma separated list of exluded portals
        schema:
          type: string
      - name: groupResults
        in: query
        description: "Group Results By Refer, this will show just one line for each\
          \ group of reservations"
        schema:
          type: boolean
      - name: sortBy
        in: query
        description: "Sort by field, for instance, createTime.asc. Possible values\
          \ are [fieldName].[asc|desc]"
        schema:
          type: string
      - name: refer
        in: query
        description: Reference of a group of reservations
        schema:
          type: string
      - name: type
        in: query
        description: "Change the type of date search.  <ul><li>Some of the meaning\
          \ of the allowed status: STAY (Accept interval, Period of stay)</li> <li>Checkin/Checkout\
          \ (Accept interval, Date of Checkin/out in that range)</li>  <li>CREATETIME(\
          \ Accept interval, Time of creation )</li> <li>MODIFIED ( Modified in the\
          \ last 3 days, not seen by the user ) </li> <li>MODIFIED_BETWEEN ( Specify\
          \ the date of modification and load just these reservations ) </li> <li>NEWLY\
          \ (Created in the last 3 days, not seen by the user) </li></ul>"
        schema:
          type: string
          enum:
          - ACTIVE
          - CHECKIN
          - CHECKOUT
          - CREATETIME
          - TODAYARRIVALS
          - TOMORROWARRIVALS
          - NEXT3ARRIVALS
          - NEXT7ARRIVALS
          - TODAYDEPARTURES
          - MODIFIED
          - MODIFIED_BETWEEN
          - NEWLY
          - STAY
          - IN_HOUSE
          - NO_CHECKOUT
          - CANCELLATION
          default: STAY
        example: CHECKIN
      - name: startDate
        in: query
        description: Date in format yyyy-MM-dd. Result depends on date type. For format
          yyyy-MM-dd date is always considered Rome Time
        schema:
          type: string
          format: date
        example: 2020-01-01
      - name: endDate
        in: query
        description: Date in format yyyy-MM-dd. Result depends on date type. For format
          yyyy-MM-dd date is always considered Rome Time
        schema:
          type: string
          format: date
        example: 2020-01-01
      - name: referIsExclusive
        in: query
        description: "Set False to combine the refer with the other fields, otherwise\
          \ the search is exclusive"
        schema:
          type: boolean
      - name: agency
        in: query
        description: Id agency customer registry
        schema:
          type: integer
          format: int64
        example: 7179327
      - name: effectiveCheckedIn
        in: query
        description: Use this filter to include only reservations with effective checking
          (True) or only reservations without effective checkin (False)
        schema:
          type: boolean
        example: "True"
      - name: effectiveCheckedOut
        in: query
        description: Use this filter to include only reservations with effective checkout
          (True) or only reservations without effective checkout (False)
        schema:
          type: boolean
        example: "True"
      - name: fields
        in: query
        description: "List of fields to filter in the response. Can be usefull to\
          \ save bandwith and get quicker response from this server. Values are separated\
          \ by comma, only applies to the first level, like this: 'checkin, guests'"
        schema:
          type: string
      - name: size
        in: query
        description: 'How many results per page? '
        schema:
          maximum: 200
          minimum: 1
          type: integer
          format: int32
          default: 20
      - name: page
        in: query
        description: Page number of the results
        schema:
          maximum: 1000
          minimum: 0
          type: integer
          format: int32
      responses:
        "200":
          description: Content retrieved
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/ApiReservationRespDTO"
              examples:
                Example of response:
                  description: Example of response
                  value:
                    data:
                    - refer: 2747527224_2861871781
                      channelId: 142
                      channelRefer: 26040G2696
                      status: CONFIRMED
                      checkin: "2020-07-06T22:00:00Z[UTC]"
                      checkout: "2020-07-14T07:00:00Z[UTC]"
                      createTime: "2020-04-26T15:20:50Z[UTC]"
                      updateTime: "2020-06-18T14:04:31Z[UTC]"
                      guests:
                      - address: Rue de Paris
                        checkin: 2020-07-07
                        checkout: 2020-07-14
                        city: Paris
                        email: elampa.252439@guest.booking.com
                        familyName: Last Name
                        givenName: Elisa
                        language: IT
                        nationality: IT
                        phone: +39 339 636 1111
                        source: PORTAL
                        type: BOOKER
                      - address: ""
                        checkin: 2020-07-07
                        checkout: 2020-07-14
                        city: "412058091"
                        documentCode: ""
                        familyName: Same last name
                        givenName: Elisa Sister
                        source: USER
                        type: GUEST
                      - address: ""
                        checkin: 2020-07-07
                        checkout: 2020-07-14
                        city: "412058091"
                        documentCode: AX23233
                        documentExpire: 2020-06-18T00:00:00
                        documentType: Passport
                        familyName: Last Name
                        givenName: Elisa
                        source: USER
                        type: GUEST
                      pmsProduct: 57600
                      product: 234762
                      totalGross: 552.5
                      totalGuest: 1
                      accommodation:
                        currency: EUR
                        id: "112696"
                        name: La Pergola di Venezia
                        timeZone: Europe/Rome
                      channelName: Booking
                      currency: EUR
                      freeCancellation: true
                      id: 92180827
                      paymentStatus: PARTIALLY_PAID
                      paymentType: CREDITCARD
                      payments:
                      - amount: 20.0
                        cityTaxAmount: 8.0
                        description: ""
                        id: 3342726
                        insertTime: "2020-06-18T16:04:00Z[UTC]"
                        paymentMode: CASH
                        referenceTime: "2020-06-18T16:04:00Z[UTC]"
                        scheduled: false
                        user:
                          codpromo: ""
                          firstname: Devin
                          id: 21367
                          type: ADMIN
                          username: octo_devin
                      priceBreakdown:
                      - type: DAILY_ROOM_PRICE
                        name: null
                        createTime: null
                        day: 2020-07-07
                        price: 67.5
                        reference: "6495370"
                        included: true
                        product: null
                        quantity: null
                      - type: DAILY_ROOM_PRICE
                        name: null
                        createTime: null
                        day: 2020-07-08
                        price: 67.5
                        reference: "6495371"
                        included: true
                        product: null
                        quantity: null
                      - type: DAILY_ROOM_PRICE
                        name: null
                        createTime: null
                        day: 2020-07-09
                        price: 67.5
                        reference: "6495372"
                        included: true
                        product: null
                        quantity: null
                      - type: DAILY_ROOM_PRICE
                        name: null
                        createTime: null
                        day: 2020-07-10
                        price: 67.5
                        reference: "6495373"
                        included: true
                        product: null
                        quantity: null
                      - type: DAILY_ROOM_PRICE
                        name: null
                        createTime: null
                        day: 2020-07-11
                        price: 67.5
                        reference: "6495374"
                        included: true
                        product: null
                        quantity: null
                      - type: DAILY_ROOM_PRICE
                        name: null
                        createTime: null
                        day: 2020-07-12
                        price: 67.5
                        reference: "6495375"
                        included: true
                        product: null
                        quantity: null
                      - type: DAILY_ROOM_PRICE
                        name: null
                        createTime: null
                        day: 2020-07-13
                        price: 67.5
                        reference: "6495376"
                        included: true
                        product: null
                        quantity: null
                      - type: ROOM_NET
                        name: null
                        createTime: null
                        day: null
                        price: 472.5
                        reference: null
                        included: true
                        product: null
                        quantity: null
                      - type: VAT
                        name: null
                        createTime: null
                        day: null
                        price: 0.0
                        reference: null
                        included: true
                        product: null
                        quantity: null
                      - type: EXTRA
                        name: Bike Rental
                        createTime: "2020-06-18T14:04:15Z[UTC]"
                        day: 2020-07-14
                        price: 10.0
                        reference: "293644"
                        included: true
                        product: 207585
                        quantity: null
                      - type: EXTRA
                        name: Bike Rental
                        createTime: "2020-06-18T14:04:15Z[UTC]"
                        day: 2020-07-10
                        price: 10.0
                        reference: "293643"
                        included: true
                        product: 207585
                        quantity: null
                      - type: EXTRA
                        name: Bike Rental
                        createTime: "2020-06-18T14:04:15Z[UTC]"
                        day: 2020-07-09
                        price: 10.0
                        reference: "293642"
                        included: true
                        product: 207585
                        quantity: null
                      - type: EXTRA
                        name: Bike Rental
                        createTime: "2020-06-18T14:04:15Z[UTC]"
                        day: 2020-07-07
                        price: 10.0
                        reference: "293641"
                        included: true
                        product: 207585
                        quantity: null
                      - type: EXTRA
                        name: Bike Rental
                        createTime: "2020-06-18T14:04:15Z[UTC]"
                        day: 2020-07-13
                        price: 10.0
                        reference: "293640"
                        included: true
                        product: 207585
                        quantity: null
                      - type: EXTRA
                        name: Bike Rental
                        createTime: "2020-06-18T14:04:15Z[UTC]"
                        day: 2020-07-11
                        price: 10.0
                        reference: "293639"
                        included: true
                        product: 207585
                        quantity: null
                      - type: EXTRA
                        name: Bike Rental
                        createTime: "2020-06-18T14:04:15Z[UTC]"
                        day: 2020-07-12
                        price: 10.0
                        reference: "293638"
                        included: true
                        product: 207585
                        quantity: null
                      - type: EXTRA
                        name: Bike Rental
                        createTime: "2020-06-18T14:04:15Z[UTC]"
                        day: 2020-07-08
                        price: 10.0
                        reference: "293637"
                        included: true
                        product: 207585
                        quantity: null
                      - type: COMMISSION
                        name: null
                        createTime: null
                        day: null
                        price: 70.88
                        reference: null
                        included: false
                        product: null
                        quantity: null
                      - type: TOURIST_TAX
                        name: null
                        createTime: null
                        day: null
                        price: 8.0
                        reference: null
                        included: false
                        product: null
                        quantity: null
                      roomGross: 472.5
                      totalChildren: 0
                      totalInfants: 0
                      touristTax: 8.0
                    page:
                      page: 0
                      totalPages: 1
                      self:
                        href: http://localhost:8080/octobook/rest/reservation/112696?page=0
                        rel: self
                        type: ApiReservationResp
                      next:
                        href: http://localhost:8080/octobook/rest/reservation/112696?page=1
                        rel: next
                        type: ApiReservationResp
    post:
      tags:
      - "Property: Reservations"
      description: Create a new Reservation
      operationId: createSingleReservation
      parameters:
      - name: availability
        in: query
        schema:
          type: boolean
          description: Optional parameter to let octorate know if decrement the availability
          default: true
      - name: accommodation
        in: path
        required: true
        schema:
          type: string
      requestBody:
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ApiReservationReqDTO"
      responses:
        default:
          description: default response
          content:
            application/json: {}
  /rest/v1/reservation/{accommodation}/{id}/extra/group/{externalId}:
    delete:
      tags:
      - "Property: Reservations"
      description: Delete an extra of reservation given
      operationId: deleteExtraGroupReservation
      parameters:
      - name: id
        in: path
        description: Reservation ID (Octorate ID)
        required: true
        schema:
          type: integer
          format: int64
      - name: accommodation
        in: path
        description: Property code (ID)
        required: true
        schema:
          type: string
      - name: externalId
        in: path
        description: Id of the extra group
        required: true
        schema:
          type: string
      responses:
        "200":
          description: Element deleted
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ApiExtraDetailDTO"
  /rest/v1/reservation/{accommodation}/{id}/extra/{extraId}:
    put:
      tags:
      - "Property: Reservations"
      description: Update an existing reservation
      operationId: updateExtraReservation
      parameters:
      - name: id
        in: path
        description: Reservation ID (Octorate ID)
        required: true
        schema:
          type: integer
          format: int64
      - name: accommodation
        in: path
        description: Property ID (Octorate ID)
        required: true
        schema:
          type: string
      - name: extraId
        in: path
        required: true
        schema:
          type: integer
          format: int64
      requestBody:
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ApiExtraDetailDTO"
      responses:
        "200":
          description: Element updated
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ApiExtraDetailDTO"
        "304":
          description: "Not Modified (empty response): The content you've present\
            \ excluding required fields doesn't change anything inside Octorate."
        "400":
          description: Invalid request
        "401":
          description: There is something wrong with you api key
          content:
            application/json:
              schema:
                type: string
                example:
                  message: Missing credentials
                  type: ApiSecurityException
        "404":
          description: Resource not found
          content:
            application/json:
              schema:
                type: string
                example:
                  element: reservation
                  message: The resource reservation doesn't exists
                  type: ApiResourceMissing
        "500":
          description: Internal Server Error
          content:
            application/json:
              schema:
                type: string
                example:
                  type: ApiServerException
    delete:
      tags:
      - "Property: Reservations"
      description: Delete an extra of reservation given
      operationId: deleteExtraReservation
      parameters:
      - name: id
        in: path
        description: Reservation ID (Octorate ID)
        required: true
        schema:
          type: integer
          format: int64
      - name: accommodation
        in: path
        description: Property code (ID)
        required: true
        schema:
          type: string
      - name: extraId
        in: path
        description: Id of the extra
        required: true
        schema:
          type: integer
          format: int64
      responses:
        "200":
          description: Element deleted
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ApiExtraDetailDTO"
  /rest/v1/reservation/{accommodation}/group/{refer}:
    delete:
      tags:
      - "Property: Reservations"
      description: "Delete a group of reservations, sharing the same refer. (Multiroom\
        \ reservations) (This method can be used as alternative of update reservation\
        \ to create a cancellation)"
      operationId: deleteGroupReservations
      parameters:
      - name: accommodation
        in: path
        required: true
        schema:
          type: string
      - name: refer
        in: path
        description: Octorate refer for reservations
        required: true
        schema:
          type: string
      responses:
        default:
          description: Request processed
          content:
            '*/*':
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/ApiReservationRespDTO"
  /rest/v1/reservation/{accommodation}/{id}/payment/{paymentId}:
    put:
      tags:
      - "Property: Reservations"
      description: Update a payment in the reservation
      operationId: updatePaymentReservation
      parameters:
      - name: id
        in: path
        description: Reservation ID (Octorate ID)
        required: true
        schema:
          type: integer
          format: int64
      - name: accommodation
        in: path
        description: Property ID (Octorate ID)
        required: true
        schema:
          type: string
      - name: paymentId
        in: path
        description: ID of the payment (Octorate ID)
        required: true
        schema:
          type: integer
          format: int64
      requestBody:
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ApiReservationPaymentDTO"
      responses:
        default:
          description: default response
          content:
            application/json: {}
    delete:
      tags:
      - "Property: Reservations"
      description: Update a payment in the reservation
      operationId: deletePaymentReservation
      parameters:
      - name: id
        in: path
        description: Reservation ID (Octorate ID)
        required: true
        schema:
          type: integer
          format: int64
      - name: accommodation
        in: path
        description: Property ID (Octorate ID)
        required: true
        schema:
          type: string
      - name: paymentId
        in: path
        description: ID of the payment (Octorate ID)
        required: true
        schema:
          type: integer
          format: int64
      responses:
        default:
          description: default response
          content:
            application/json: {}
  /rest/v1/reservation/{accommodation}/{id}:
    get:
      tags:
      - "Property: Reservations"
      description: Retrieve an existing reservation. Deprecated. Use the GET of many
        reservations with ID param
      operationId: findReservation
      parameters:
      - name: accommodation
        in: path
        required: true
        schema:
          type: string
      - name: id
        in: path
        required: true
        schema:
          type: integer
          format: int64
      responses:
        "200":
          description: Retrieved reservation
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ApiReservationRespDTO"
      deprecated: true
    put:
      tags:
      - "Property: Reservations"
      description: Update an existing reservation
      operationId: updateReservation
      parameters:
      - name: id
        in: path
        required: true
        schema:
          type: integer
          format: int64
      - name: accommodation
        in: path
        required: true
        schema:
          type: string
      - name: availability
        in: query
        description: Define if update the availability according to room/dates. Default
          is true
        schema:
          type: boolean
      requestBody:
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ApiReservationReqDTO"
      responses:
        default:
          description: default response
          content:
            application/json: {}
    delete:
      tags:
      - "Property: Reservations"
      description: Delete a reservation (This method can be used as alternative of
        update reservation to create a cancellation)
      operationId: deleteReservation
      parameters:
      - name: accommodation
        in: path
        required: true
        schema:
          type: string
      - name: id
        in: path
        required: true
        schema:
          type: integer
          format: int64
      responses:
        default:
          description: Request processed
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ApiReservationRespDTO"
    patch:
      tags:
      - "Property: Reservations"
      description: "Partially update an existing reservation. Only the fields included\
        \ in the request body are updated; omitted fields retain their current value.\
        \ The `status` field is optional: if not provided, the existing reservation\
        \ status is preserved. Direct transition from CONFIRMED to CANCELLED is not\
        \ allowed via this endpoint."
      operationId: patchReservation
      parameters:
      - name: id
        in: path
        required: true
        schema:
          type: integer
          format: int64
      - name: accommodation
        in: path
        required: true
        schema:
          type: string
      requestBody:
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ApiReservationReqDTO"
      responses:
        default:
          description: default response
          content:
            application/json: {}
  /rest/v1/reservation/{reservationId}/split:
    delete:
      tags:
      - "Property: Reservations"
      description: Delete a created split
      operationId: deleteSplit
      parameters:
      - name: reservationId
        in: path
        required: true
        schema:
          type: integer
          format: int64
      responses:
        default:
          description: default response
          content:
            application/json: {}
  /rest/v1/reservation/{accommodation}/search:
    get:
      tags:
      - "Property: Reservations"
      summary: Booking Engine Search
      description: Perform an API search in the Booking Engine like the user would
        do
      operationId: searchApiAccommodation
      parameters:
      - name: accommodation
        in: path
        description: The accommodation id
        required: true
        schema:
          type: string
      - name: "ids[]"
        in: query
        description: The product ids to restrict search
        schema:
          type: array
          items:
            type: integer
            format: int64
      - name: checkin
        in: query
        description: Date of the checkin in format yyyy-MM-dd
        schema:
          type: string
          description: yyyy-MM-dd
          format: date
          example: 2021-01-01
      - name: checkout
        in: query
        description: Date of the checkout in format yyyy-MM-dd
        schema:
          type: string
          format: date
          example: 2021-01-01
      - name: currency
        in: query
        description: Expected currency result (in ISO3 CODE)
        schema:
          type: string
      - name: availcheck
        in: query
        description: If true check availability
        schema:
          type: boolean
      responses:
        "200":
          description: List of Search results
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/SearchRoomResult"
        "400":
          description: Request was made wrongly
        "403":
          description: Access Denied. Access to the resource denied
  /rest/v1/reservation/search/hotel:
    get:
      tags:
      - "Property: Reservations"
      description: "Search rooms for a specific hotel, considering various filter\
        \ options (adults, children, availability, etc.)"
      operationId: searchHotel
      parameters:
      - name: id
        in: query
        schema:
          type: integer
          format: int64
      - name: checkin
        in: query
        schema:
          type: string
      - name: checkout
        in: query
        schema:
          type: string
      - name: currency
        in: query
        schema:
          type: string
      - name: "ids[]"
        in: query
        schema:
          type: array
          items:
            type: integer
            format: int64
      - name: adults
        in: query
        schema:
          type: integer
          format: int32
      - name: children
        in: query
        schema:
          type: integer
          format: int32
      - name: availcheck
        in: query
        schema:
          type: boolean
      - name: applyDiscount
        in: query
        schema:
          type: boolean
      - name: showHidden
        in: query
        schema:
          type: boolean
      - name: showRates
        in: query
        schema:
          type: boolean
      - name: ignoreGreaterPax
        in: query
        schema:
          type: boolean
      - name: showLowerOccupancyResult
        in: query
        schema:
          type: boolean
      responses:
        "200":
          description: Successfully retrieved room availability data
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/SearchRoomResult"
        "204":
          description: No rooms available for the selected hotel and dates
        "400":
          description: Invalid input parameters
  /rest/v1/reservation/{accommodation}/{reservationId}/split:
    post:
      tags:
      - "Property: Reservations"
      description: Split the reservation in two parts
      operationId: splitReservation
      parameters:
      - name: reservationId
        in: path
        required: true
        schema:
          type: integer
          format: int64
      - name: accommodation
        in: path
        required: true
        schema:
          type: string
      requestBody:
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ApiReservationSplit"
        required: true
      responses:
        default:
          description: default response
          content:
            application/json: {}
  /rest/v1/calendar/bulk:
    post:
      tags:
      - "ARI: Calendar"
      summary: Update Calendar (ARI)
      description: "Update the calendar values for the given rooms and date intervals.\
        \ It takes in input a list. <br/>Take care: Every 15 room/day requestes, one\
        \ more quota is consumed. Please optimize your calls to avoid unuseful requests.\
        \ Maximum available quota is based on your properties. Likely (but just to\
        \ give an example) you can perform only 5/6 2 year full update per 5 minutes."
      operationId: bulk
      requestBody:
        content:
          application/json:
            schema:
              type: array
              items:
                $ref: "#/components/schemas/CalendarBulkRequest"
      responses:
        default:
          description: default response
          content:
            application/json: {}
  /rest/v1/calendar/{accommodation}/{productId}/availabilityCheck:
    get:
      tags:
      - "ARI: Calendar"
      description: Perform a check for availability on Octorate Platform. The response
        is based on all the preference of the accommodation for the booking engine
      operationId: Availability Check
      parameters:
      - name: accommodation
        in: path
        required: true
        schema:
          type: string
      - name: productId
        in: path
        required: true
        schema:
          type: integer
          format: int64
      - name: startDate
        in: query
        schema:
          type: string
          format: date
      - name: endDate
        in: query
        schema:
          type: string
          format: date
      responses:
        "200":
          description: Available to book
        "406":
          description: Not available to book
  /rest/v1/calendar/{accommodation}:
    get:
      tags:
      - "ARI: Calendar"
      description: Read the calendar data
      operationId: readCalendar
      parameters:
      - name: accommodation
        in: path
        required: true
        schema:
          type: string
      - name: "product[]"
        in: query
        description: Repeatable list of products to search
        schema:
          type: array
          items:
            type: integer
            format: int64
      - name: dateFrom
        in: query
        description: The date where the search should be performed
        schema:
          type: string
          format: date
        example: 2020-02-12
      - name: dateTo
        in: query
        description: The end date of the search
        schema:
          type: string
          format: date
        example: 2020-02-12
      - name: size
        in: query
        description: Number of room rates (products) to load per page
        schema:
          maximum: 20
          minimum: 0
          type: integer
          format: int32
          default: 5
        example: 10
      - name: page
        in: query
        description: Page to retrieve
        schema:
          minimum: 0
          type: integer
          format: int32
      responses:
        "200":
          description: Processed
          content:
            application/json:
              schema:
                maxItems: 5
                type: array
                items:
                  $ref: "#/components/schemas/ApiCalendarRoom"
              examples:
                Example:
                  description: Example
                  value:
                    data:
                    - id: 253166
                      name: Camera singola Derived
                      days:
                      - availability: 1
                        bookable: true
                        closeToArrival: false
                        closeToDeparture: false
                        cutOffDays: 0
                        date: 2020-04-01
                        maxStay: 99
                        minStay: 2
                        price: 39
                        stopSells: false
  /rest/v1/content/products/{accommodation}/addNeighborhoodod:
    post:
      tags:
      - "Content: Rooms / Apartment"
      description: "Create a new description for a room/rate, replacing existing object\
        \ with the one provided. This IS NOT the octorate rate, but what the portals\
        \ could receive"
      operationId: createNeighborhoodod
      parameters:
      - name: accommodation
        in: path
        description: The ID of the accommodation. Must not be master accommodation
        required: true
        schema:
          type: string
      - name: productId
        in: query
        description: The ID of the room or rate
        schema:
          type: integer
          format: int64
      - name: listingId
        in: query
        description: Alternative to accommodation and product
        schema:
          type: boolean
      - name: ownership
        in: query
        schema:
          type: boolean
      - name: listingId
        in: query
        schema:
          type: string
      - name: minWords
        in: query
        description: The number of minimum words of the all text
        schema:
          type: integer
          format: int32
      - name: maxWords
        in: query
        description: The number of maximum words of the all text
        schema:
          type: integer
          format: int32
      requestBody:
        description: "ExternalDescriptions object that rappresent the description\
          \ to use in the portal, if null use the properties of the reservation to\
          \ add text to the house rules"
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ExternalDescriptions"
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: Internal Server Error
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      security:
      - OAuthLogin: []
  /rest/v1/content/products/{accommodation}/{productId}/addTextToField:
    post:
      tags:
      - "Content: Rooms / Apartment"
      description: Update the field with a random string. The string is loaded by
        the array in the req map
      operationId: addTextToField
      parameters:
      - name: accommodation
        in: path
        description: The ID of the accommodation
        required: true
        schema:
          type: string
      - name: productId
        in: path
        description: The ID of the room or rate
        required: true
        schema:
          type: integer
          format: int64
      - name: minWords
        in: query
        description: The number of minimum words of the all text
        schema:
          type: integer
          format: int32
      - name: maxWords
        in: query
        description: The number of maximum words of the all text
        schema:
          type: integer
          format: int32
      - name: field
        in: query
        description: The field to update
        schema:
          type: string
      requestBody:
        description: "Array of strings, use a random string to update the field"
        content:
          application/json:
            schema:
              type: object
              additionalProperties:
                type: object
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: Internal Server Error
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      security:
      - OAuthLogin: []
  /rest/v1/content/products/{accommodation}/{productId}/addTextToHouseRules:
    post:
      tags:
      - "Content: Rooms / Apartment"
      description: "Create a new description for a room/rate, replacing existing object\
        \ with the one provided. This IS NOT the octorate rate, but what the portals\
        \ could receive"
      operationId: createDescription
      parameters:
      - name: accommodation
        in: path
        description: The ID of the accommodation
        required: true
        schema:
          type: string
      - name: productId
        in: path
        description: The ID of the room or rate
        required: true
        schema:
          type: integer
          format: int64
      - name: minWords
        in: query
        description: The number of minimum words of the all text
        schema:
          type: integer
          format: int32
      - name: maxWords
        in: query
        description: The number of maximum words of the all text
        schema:
          type: integer
          format: int32
      requestBody:
        description: "ExternalDescriptions object that rappresent the description\
          \ to use in the portal, if null use the properties of the reservation to\
          \ add text to the house rules"
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ExternalDescriptions"
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: Internal Server Error
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      security:
      - OAuthLogin: []
  /rest/v1/content/products/{accommodation}/{productId}/availabilityconf:
    get:
      tags:
      - "Content: Rooms / Apartment"
      description: Retrieve the availability information
      operationId: getAvailability
      parameters:
      - name: accommodation
        in: path
        description: The ID of the accommodation
        required: true
        schema:
          type: string
      - name: productId
        in: path
        description: The ID of the room or rate
        required: true
        schema:
          type: integer
          format: int64
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: Internal Server Error
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      security:
      - OAuthLogin: []
    post:
      tags:
      - "Content: Rooms / Apartment"
      operationId: createAvailability
      parameters:
      - name: accommodation
        in: path
        description: The ID of the accommodation
        required: true
        schema:
          type: string
      - name: productId
        in: path
        description: The ID of the room or rate
        required: true
        schema:
          type: integer
          format: int64
      requestBody:
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ExternalAvailabilityConf"
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: Internal Server Error
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      security:
      - OAuthLogin: []
  /rest/v1/content/products/{accommodation}/{productId}/descriptions:
    get:
      tags:
      - "Content: Rooms / Apartment"
      operationId: getDescriptions
      parameters:
      - name: accommodation
        in: path
        description: The ID of the accommodation
        required: true
        schema:
          type: string
      - name: productId
        in: path
        description: The ID of the room or rate
        required: true
        schema:
          type: integer
          format: int64
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: Internal Server Error
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      security:
      - OAuthLogin: []
    post:
      tags:
      - "Content: Rooms / Apartment"
      description: "Create a new description for a room/rate, replacing existing object\
        \ with the one provided. This IS NOT the octorate rate, but what the portals\
        \ could receive"
      operationId: createDescription_1
      parameters:
      - name: accommodation
        in: path
        description: The ID of the accommodation
        required: true
        schema:
          type: string
      - name: productId
        in: path
        description: The ID of the room or rate
        required: true
        schema:
          type: integer
          format: int64
      requestBody:
        description: ExternalDescriptions object that rappresent the description to
          use in the portal
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ExternalDescriptions"
        required: true
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: Internal Server Error
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      security:
      - OAuthLogin: []
    patch:
      tags:
      - "Content: Rooms / Apartment"
      description: "Update an existing description for a room/rate, avoiding cancel\
        \ not provided values"
      operationId: patchDescription
      parameters:
      - name: accommodation
        in: path
        description: The ID of the accommodation
        required: true
        schema:
          type: string
      - name: productId
        in: path
        description: The ID of the room or rate
        required: true
        schema:
          type: integer
          format: int64
      requestBody:
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ExternalDescriptions"
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: Internal Server Error
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      security:
      - OAuthLogin: []
  /rest/v1/content/products/{accommodation}/{productId}/fees:
    get:
      tags:
      - "Content: Rooms / Apartment"
      description: Retrieve the fees for an existing room/rate
      operationId: getFees
      parameters:
      - name: accommodation
        in: path
        description: The ID of the accommodation
        required: true
        schema:
          type: string
      - name: productId
        in: path
        description: The ID of the room or rate
        required: true
        schema:
          type: integer
          format: int64
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: Internal Server Error
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      security:
      - OAuthLogin: []
    post:
      tags:
      - "Content: Rooms / Apartment"
      description: Create a new FEE for that room/rate
      operationId: createRoomFee
      parameters:
      - name: accommodation
        in: path
        description: The ID of the accommodation
        required: true
        schema:
          type: string
      - name: productId
        in: path
        description: The ID of the room or rate
        required: true
        schema:
          type: integer
          format: int64
      requestBody:
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ExternalFee"
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: Internal Server Error
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      security:
      - OAuthLogin: []
  /rest/v1/content/products/{accommodation}/{productId}/listing:
    get:
      tags:
      - "Content: Rooms / Apartment"
      description: Retrieve the basic listing information
      operationId: getListing
      parameters:
      - name: accommodation
        in: path
        description: The ID of the accommodation
        required: true
        schema:
          type: string
      - name: productId
        in: path
        description: The ID of the room or rate
        required: true
        schema:
          type: integer
          format: int64
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: Internal Server Error
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "404":
          description: Room or Accommodation not found
          headers:
            request-id:
              description: Identifier of your request
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      security:
      - OAuthLogin: []
    post:
      tags:
      - "Content: Rooms / Apartment"
      description: Create the listing information
      operationId: configListing
      parameters:
      - name: accommodation
        in: path
        description: The ID of the accommodation
        required: true
        schema:
          type: string
      - name: productId
        in: path
        description: The ID of the room or rate
        required: true
        schema:
          type: integer
          format: int64
      requestBody:
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ExternalListing"
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: Internal Server Error
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      security:
      - OAuthLogin: []
    patch:
      tags:
      - "Content: Rooms / Apartment"
      description: "Update a listing, without clear not given fields"
      operationId: patchListing
      parameters:
      - name: accommodation
        in: path
        description: The ID of the accommodation
        required: true
        schema:
          type: string
      - name: productId
        in: path
        description: The ID of the room or rate
        required: true
        schema:
          type: integer
          format: int64
      requestBody:
        description: The Listing information. Listing contains basic info regarding
          a room
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ExternalListing"
        required: true
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: Internal Server Error
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      security:
      - OAuthLogin: []
  /rest/v1/content/products/{accommodation}/{productId}/pricing:
    post:
      tags:
      - "Content: Rooms / Apartment"
      description: "Update an existing *pricing* for a room/rate, setting as empty\
        \ not provided values"
      operationId: createPricing
      parameters:
      - name: accommodation
        in: path
        description: The ID of the accommodation
        required: true
        schema:
          type: string
      - name: productId
        in: path
        description: The ID of the room or rate
        required: true
        schema:
          type: integer
          format: int64
      requestBody:
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ExternalPricing"
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: Internal Server Error
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      security:
      - OAuthLogin: []
    patch:
      tags:
      - "Content: Rooms / Apartment"
      description: "Update an existing *pricing* for a room/rate, without touching\
        \ already provided values"
      operationId: patchPricing
      parameters:
      - name: accommodation
        in: path
        description: The ID of the accommodation
        required: true
        schema:
          type: string
      - name: productId
        in: path
        description: The ID of the room or rate
        required: true
        schema:
          type: integer
          format: int64
      requestBody:
        content:
          application/json:
            schema:
              type: string
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: Internal Server Error
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      security:
      - OAuthLogin: []
  /rest/v1/content/products/{accommodation}/{productId}/rate:
    get:
      tags:
      - "Content: Rooms / Apartment"
      description: Retrieve the rate informations and restrictions
      operationId: getRateConf
      parameters:
      - name: accommodation
        in: path
        description: The ID of the accommodation
        required: true
        schema:
          type: string
      - name: productId
        in: path
        description: The ID of the room or rate
        required: true
        schema:
          type: integer
          format: int64
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: Internal Server Error
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      security:
      - OAuthLogin: []
    post:
      tags:
      - "Content: Rooms / Apartment"
      description: Create a new rate setting up the restrictions. All not given values
        will be replaced with empty
      operationId: createRateConf
      parameters:
      - name: accommodation
        in: path
        description: The ID of the accommodation
        required: true
        schema:
          type: string
      - name: productId
        in: path
        description: The ID of the room or rate
        required: true
        schema:
          type: integer
          format: int64
      requestBody:
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ExternalRateContent"
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: Internal Server Error
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      security:
      - OAuthLogin: []
    patch:
      tags:
      - "Content: Rooms / Apartment"
      description: Create a new rate setting up the restrictions. All not given values
        will be left untouched
      operationId: patchRoomRate
      parameters:
      - name: accommodation
        in: path
        description: The ID of the accommodation
        required: true
        schema:
          type: string
      - name: productId
        in: path
        description: The ID of the room or rate
        required: true
        schema:
          type: integer
          format: int64
      requestBody:
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ExternalRateContent"
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: Internal Server Error
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      security:
      - OAuthLogin: []
  /rest/v1/content/products/{accommodation}/{productId}/reservation:
    post:
      tags:
      - "Content: Rooms / Apartment"
      description: "Update reservation settings for a room/rate, replacing all the\
        \ existing values (not given will be cleared)"
      operationId: configReservation
      parameters:
      - name: accommodation
        in: path
        description: The ID of the accommodation
        required: true
        schema:
          type: string
      - name: productId
        in: path
        description: The ID of the room or rate
        required: true
        schema:
          type: integer
          format: int64
      requestBody:
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ExternalReservationConf"
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: Internal Server Error
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      security:
      - OAuthLogin: []
    patch:
      tags:
      - "Content: Rooms / Apartment"
      description: "Update reservation settings for a room/rate, without clear not\
        \ given values"
      operationId: patchReservation_1
      parameters:
      - name: accommodation
        in: path
        description: The ID of the accommodation
        required: true
        schema:
          type: string
      - name: productId
        in: path
        description: The ID of the room or rate
        required: true
        schema:
          type: integer
          format: int64
      requestBody:
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ExternalReservationConf"
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: Internal Server Error
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      security:
      - OAuthLogin: []
  /rest/v1/content/products/{accommodation}/{productId}/rooms:
    get:
      tags:
      - "Content: Rooms / Apartment"
      description: Retrieve all the rooms (subrooms with bed configuration) existing
        for the selected room/rate
      operationId: listRoomSubrooms
      parameters:
      - name: accommodation
        in: path
        description: The ID of the accommodation
        required: true
        schema:
          type: string
      - name: productId
        in: path
        description: The ID of the room or rate
        required: true
        schema:
          type: integer
          format: int64
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: Internal Server Error
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      security:
      - OAuthLogin: []
    post:
      tags:
      - "Content: Rooms / Apartment"
      description: Create a new room
      operationId: addRoomSubRoom
      parameters:
      - name: accommodation
        in: path
        description: The ID of the accommodation
        required: true
        schema:
          type: string
      - name: productId
        in: path
        description: The ID of the room or rate
        required: true
        schema:
          type: integer
          format: int64
      requestBody:
        description: The subroom to push (i.e. the living room)
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ExternalRoomDescriptor"
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: Internal Server Error
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      security:
      - OAuthLogin: []
  /rest/v1/content/products/{accommodation}/{productId}/fees/{index}:
    delete:
      tags:
      - "Content: Rooms / Apartment"
      description: Delete the previously found fee
      operationId: deleteRoomFee
      parameters:
      - name: accommodation
        in: path
        description: The ID of the accommodation
        required: true
        schema:
          type: string
      - name: productId
        in: path
        description: The ID of the room or rate
        required: true
        schema:
          type: integer
          format: int64
      - name: index
        in: path
        required: true
        schema:
          type: integer
          format: int32
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: Internal Server Error
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      security:
      - OAuthLogin: []
  /rest/v1/content/products/{accommodation}/{productId}/photos/{photoName}:
    delete:
      tags:
      - "Content: Rooms / Apartment"
      description: Delete an already uploaded photo
      operationId: deleteRoomPhoto
      parameters:
      - name: accommodation
        in: path
        description: The ID of the accommodation
        required: true
        schema:
          type: string
      - name: productId
        in: path
        description: The ID of the room or rate
        required: true
        schema:
          type: integer
          format: int64
      - name: photoName
        in: path
        required: true
        schema:
          type: string
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: Internal Server Error
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      security:
      - OAuthLogin: []
  /rest/v1/content/products/{accommodation}/{productId}/rooms/{index}:
    delete:
      tags:
      - "Content: Rooms / Apartment"
      description: Delete a previously found room
      operationId: deleteRoomSubRoom
      parameters:
      - name: accommodation
        in: path
        required: true
        schema:
          type: string
      - name: productId
        in: path
        required: true
        schema:
          type: integer
          format: int64
      - name: index
        in: path
        required: true
        schema:
          type: integer
          format: int32
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: Internal Server Error
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      security:
      - OAuthLogin: []
  /rest/v1/content/products/{accommodation}/process/{processId}:
    get:
      tags:
      - "Content: Rooms / Apartment"
      description: Check the status of one sent process
      operationId: readContentProcess
      parameters:
      - name: accommodation
        in: path
        required: true
        schema:
          type: string
      - name: processId
        in: path
        required: true
        schema:
          type: integer
          format: int64
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: Internal Server Error
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      security:
      - OAuthLogin: []
  /rest/v1/content/products/{accommodation}/{productId}/amenities:
    get:
      tags:
      - "Content: Rooms / Apartment"
      description: "Retreive all the amenities of the listing. Deprecated, you can\
        \ set them directly in inventory"
      operationId: listRoomAmenities
      parameters:
      - name: accommodation
        in: path
        required: true
        schema:
          type: string
      - name: productId
        in: path
        required: true
        schema:
          type: integer
          format: int64
      - name: portal
        in: query
        schema:
          type: string
          enum:
          - BOOKING
          - AIRBNB
          - HOMEAWAY
          - 
          - HOSTELWORLD
          - HOLIDU
          - CTRIP
          - RENTALS_UNITED
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: Internal Server Error
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      deprecated: true
      security:
      - OAuthLogin: []
    post:
      tags:
      - "Content: Rooms / Apartment"
      description: "Add an amenity for all portals. Deprecated, you can add it directly\
        \ in room inventory"
      operationId: addRoomAmenity
      parameters:
      - name: accommodation
        in: path
        required: true
        schema:
          type: string
      - name: productId
        in: path
        required: true
        schema:
          type: integer
          format: int64
      - name: amenity
        in: query
        description: 'Amenity (Repetable) '
        schema:
          type: array
          items:
            type: string
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: Internal Server Error
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      deprecated: true
      security:
      - OAuthLogin: []
  /rest/v1/content/products/{accommodation}/{productId}/pushQueue/{portalname}:
    post:
      tags:
      - "Content: Rooms / Apartment"
      description: Push the room/rate to the portal specified
      operationId: pushRoomPortal
      parameters:
      - name: accommodation
        in: path
        required: true
        schema:
          type: string
      - name: productId
        in: path
        required: true
        schema:
          type: integer
          format: int64
      - name: portalname
        in: path
        required: true
        schema:
          type: string
          example: AIRBNB
          enum:
          - "booking_xml, airbnb_xml, homeaway"
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: Internal Server Error
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      security:
      - OAuthLogin: []
  /rest/v1/content/products/{accommodation}/{productId}/photos/queue:
    get:
      tags:
      - "Content: Rooms / Apartment"
      description: Check the queue of photos
      operationId: queuePhotoStatus
      parameters:
      - name: accommodation
        in: path
        description: The ID of the accommodation
        required: true
        schema:
          type: string
      - name: productId
        in: path
        description: The ID of the room or rate
        required: true
        schema:
          type: integer
          format: int64
      - name: url
        in: query
        schema:
          type: string
      - name: id
        in: query
        schema:
          type: integer
          format: int64
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: Internal Server Error
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      security:
      - OAuthLogin: []
  /rest/v1/content/products/{accommodation}/{productId}/photos:
    get:
      tags:
      - "Content: Rooms / Apartment"
      description: Retrieve already uploaded photos
      operationId: listRoomPhotos
      parameters:
      - name: accommodation
        in: path
        description: The ID of the accommodation
        required: true
        schema:
          type: string
      - name: productId
        in: path
        description: The ID of the room or rate
        required: true
        schema:
          type: integer
          format: int64
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: Internal Server Error
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      security:
      - OAuthLogin: []
    post:
      tags:
      - "Content: Rooms / Apartment"
      description: Put on queue a new photo
      operationId: uploadRoomPhoto
      parameters:
      - name: accommodation
        in: path
        description: The ID of the accommodation
        required: true
        schema:
          type: string
      - name: productId
        in: path
        description: The ID of the room or rate
        required: true
        schema:
          type: integer
          format: int64
      - name: url
        in: query
        schema:
          type: string
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: Internal Server Error
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "202":
          description: "Request processed, task started"
          headers:
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      security:
      - OAuthLogin: []
  /rest/v1/content/products/{accommodation}/{productId}/{portalname}/calendar:
    post:
      tags:
      - "Content: Rooms / Apartment"
      description: Open close the calendar inside the external portal
      operationId: calendarCloseOpen
      parameters:
      - name: accommodation
        in: path
        required: true
        schema:
          type: string
      - name: productId
        in: path
        required: true
        schema:
          type: integer
          format: int64
      - name: portalname
        in: path
        required: true
        schema:
          type: string
          example: AIRBNB
          enum:
          - "booking_xml, airbnb_xml, homeaway"
      - name: status
        in: query
        schema:
          type: boolean
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: Internal Server Error
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      security:
      - OAuthLogin: []
  /rest/v1/content/products/{accommodation}/{productId}/cancellation:
    post:
      tags:
      - "Content: Rooms / Apartment"
      description: "Set the cancellation policy for a specified PORTAL. To chose the\
        \ right value, please refer to Metas Collection"
      operationId: setRoomCancellation
      parameters:
      - name: accommodation
        in: path
        description: The ID of the accommodation
        required: true
        schema:
          type: string
      - name: productId
        in: path
        description: The ID of the room or rate
        required: true
        schema:
          type: integer
          format: int64
      - name: value
        in: query
        schema:
          type: string
          description: Value to set as cancellation policy
      - name: portal
        in: query
        schema:
          type: string
          description: "Octorate name of this portal, refer to Metas Collection to\
            \ retrieve the name of the portal"
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
        "500":
          description: Internal Server Error
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
      security:
      - OAuthLogin: []
  /rest/v1/pms:
    get:
      tags:
      - "ARI: PMS Rooms"
      description: Retrieve all the existing pms rooms for a user accommodation and
        its network
      operationId: findAllPmsRoom
      responses:
        "200":
          description: Response correctly processed
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/ApiPmsRoom"
              examples:
                Example of pms room:
                  description: Example of pms room
                  value:
                    data:
                    - clean: false
                      cleaningDays: []
                      cleaningFrequency: 0
                      id: 307848
                      linesChangeFrequency: 0
                      name: "1"
                      notes: ""
                      parentId: 307043
                      timeZone: Europe/Rome
                    - cleaningDays:
                      - MONDAY
                      cleaningFrequency: 0
                      id: 307849
                      linesChangeFrequency: 0
                      name: "1"
                      notes: ""
                      parentId: 307043
                      timeZone: Europe/Rome
  /rest/v1/pms/{accommodation}:
    get:
      tags:
      - "ARI: PMS Rooms"
      description: Retrieve all the existing pms rooms
      operationId: findPmsRoom
      parameters:
      - name: accommodation
        in: path
        description: Property where look the pms rooms
        required: true
        schema:
          type: string
      - name: name
        in: query
        description: Filter by pms room name
        schema:
          type: string
        example: 102
      - name: id
        in: query
        description: Filter by id
        schema:
          type: integer
          format: int64
        example: 185543
      - name: includeRoomsWithoutParent
        in: query
        description: Include rooms without pms parent
        schema:
          type: boolean
        example: true
      responses:
        "200":
          description: Response correctly processed
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/ApiPmsRoom"
              examples:
                Example of pms room:
                  description: Example of pms room
                  value: "{\"data\":[{\"clean\":false,\"cleaningDays\":[],\"cleaningFrequency\"\
                    :0,\"id\":307848,\"linesChangeFrequency\":0,\"name\":\"1\",\"\
                    notes\":\"\",\"parentId\":307043,\"timeZone\":\"Europe/Rome\"\
                    },{\"cleaningDays\":[ \"MONDAY\" ],\"cleaningFrequency\":0,\"\
                    id\":307849,\"linesChangeFrequency\":0,\"name\":\"1\",\"notes\"\
                    :\"\",\"parentId\":307043,,\"timeZone\":\"Europe/Rome\"}]}"
  /rest/v1/roomrates/{accommodation}:
    post:
      tags:
      - "ARI: Rooms & Rates"
      summary: create a room or a rate
      externalDocs:
        description: Documentation for Room and Rates
        url: https://community.octorate.com/search?query=room%20and%20rates
      operationId: createRoomRate
      parameters:
      - name: accommodation
        in: path
        required: true
        schema:
          type: string
      requestBody:
        description: "The unit to create in octorate, could be a basic room or a derived\
          \ rate"
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ApiRoomDTO"
        required: true
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "500":
          description: "Internal Server Error, something bad occourend on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: Processed
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/ApiItemResponse"
              examples:
                Successfully processed:
                  description: Successfully processed
                  value:
                    data:
                    - id: 207677
                      name: TEST EXTRA
                      accommodation:
                        currency: EUR
                        id: "112696"
                        name: La Pergola di Venezia
                        timeZone: Europe/Rome
                      enabled: false
                      mandatory: false
                      refundable: false
                      basePrice: 0.0
                      description: {}
                      model: BOOKING
                      taxPercent: 0.0
                      title: {}
                    - id: 207678
                      name: TEST EXTRA
                      accommodation:
                        currency: EUR
                        id: "112696"
                        name: La Pergola di Venezia
                        timeZone: Europe/Rome
                      enabled: false
                      mandatory: false
                      refundable: false
                      basePrice: 0.0
                      description: {}
                      model: BOOKING
                      taxPercent: 0.0
                      title: {}
      security:
      - OAuthLogin: []
  /rest/v1/roomrates/{accommodation}/{product}/suite:
    post:
      tags:
      - "ARI: Rooms & Rates"
      description: "Aggregate rooms in order to create a suite: Let the availability\
        \ be the same between many rooms. You could have for instance the Single App.\
        \ + Single App.. that may be booked together in the Suite Appar."
      externalDocs:
        description: Documentation for Room and Rates
        url: https://community.octorate.com/search?query=room%20and%20rates
      operationId: createSuite
      parameters:
      - name: accommodation
        in: path
        description: The accommodation where you want to operate
        required: true
        schema:
          type: string
      - name: product
        in: path
        description: "The product you want to aggregate. Keep care: All derived rules\
          \ existing on this room will be cleared. Number of sellable rooms for this\
          \ product will be set to 1"
        required: true
        schema:
          type: integer
          format: int64
      - name: "children[]"
        in: query
        description: "Array of products to add to this suite.  Keep care: They should\
          \ be base rooms (in availability) and not a suite"
        schema:
          type: array
          items:
            type: integer
            format: int64
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "500":
          description: "Internal Server Error, something bad occourend on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: Processed
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/ApiRoomDTO"
  /rest/v1/roomrates/{accommodation}/{productId}/image:
    delete:
      tags:
      - "ARI: Rooms & Rates"
      description: Delete The provided image
      externalDocs:
        description: Documentation for Room and Rates
        url: https://community.octorate.com/search?query=room%20and%20rates
      operationId: deleteAllRoomPhoto
      parameters:
      - name: accommodation
        in: path
        description: Accommodation Id
        required: true
        schema:
          type: string
      - name: productId
        in: path
        description: Room or Rate Id
        required: true
        schema:
          type: integer
          format: int64
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "500":
          description: "Internal Server Error, something bad occourend on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
  /rest/v1/roomrates/{accommodation}/{productId}/pmsRoomImage/{pmsRoomImageId}:
    delete:
      tags:
      - "ARI: Rooms & Rates"
      description: Delete The provided pms room image
      externalDocs:
        description: Documentation for Room and Rates
        url: https://community.octorate.com/search?query=room%20and%20rates
      operationId: deletePmsRoomImage
      parameters:
      - name: accommodation
        in: path
        description: Accommodation Id
        required: true
        schema:
          type: string
      - name: productId
        in: path
        description: Room or Rate Id
        required: true
        schema:
          type: integer
          format: int64
      - name: pmsRoomImageId
        in: path
        required: true
        schema:
          type: integer
          format: int64
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "500":
          description: "Internal Server Error, something bad occourend on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
  /rest/v1/roomrates/{accommodation}/{productId}:
    delete:
      tags:
      - "ARI: Rooms & Rates"
      description: Delete a product (room or rate)
      externalDocs:
        description: Documentation for Room and Rates
        url: https://community.octorate.com/search?query=room%20and%20rates
      operationId: deleteProduct
      parameters:
      - name: accommodation
        in: path
        description: Accommodation Id
        required: true
        schema:
          type: string
      - name: productId
        in: path
        description: Room or Rate Id
        required: true
        schema:
          type: integer
          format: int64
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "500":
          description: "Internal Server Error, something bad occourend on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: Product successfully deleted
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ApiRoomDTO"
  /rest/v1/roomrates/{accommodation}/{productId}/image/{imageId}:
    delete:
      tags:
      - "ARI: Rooms & Rates"
      description: Delete The provided image
      externalDocs:
        description: Documentation for Room and Rates
        url: https://community.octorate.com/search?query=room%20and%20rates
      operationId: deleteRoomPhoto_1
      parameters:
      - name: accommodation
        in: path
        description: Accommodation Id
        required: true
        schema:
          type: string
      - name: productId
        in: path
        description: Room or Rate Id
        required: true
        schema:
          type: integer
          format: int64
      - name: imageId
        in: path
        required: true
        schema:
          type: integer
          format: int64
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "500":
          description: "Internal Server Error, something bad occourend on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
  /rest/v1/roomrates/{accommodation}/{roomid}:
    get:
      tags:
      - "ARI: Rooms & Rates"
      externalDocs:
        description: Documentation for Room and Rates
        url: https://community.octorate.com/search?query=room%20and%20rates
      operationId: getRoom
      parameters:
      - name: accommodation
        in: path
        required: true
        schema:
          type: string
      - name: roomid
        in: path
        required: true
        schema:
          type: integer
          format: int64
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "500":
          description: "Internal Server Error, something bad occourend on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: Processed
          content:
            '*/*':
              schema:
                $ref: "#/components/schemas/ApiRoomDTO"
      security:
      - OAuthLogin: []
  /rest/v1/roomrates/{accommodation}/{roomid}/translateMissingDescriptions/{language}:
    patch:
      tags:
      - "ARI: Rooms & Rates"
      description: Translate the missing descriptions of the room reading from the
        provided language
      externalDocs:
        description: Documentation for Room and Rates
        url: https://community.octorate.com/search?query=room%20and%20rates
      operationId: translateMissingDescriptions
      parameters:
      - name: accommodation
        in: path
        required: true
        schema:
          type: string
      - name: roomid
        in: path
        required: true
        schema:
          type: integer
          format: int64
      - name: language
        in: path
        required: true
        schema:
          type: string
          enum:
          - IT
          - EN
          - FR
          - ES
          - DE
          - RU
          - PT
          - NL
          - JA
          - EL
          - TR
          - ZH
          - CA
          - RO
      requestBody:
        content:
          application/json:
            schema:
              type: string
        required: true
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "500":
          description: "Internal Server Error, something bad occourend on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: Processed
          content:
            '*/*':
              schema:
                $ref: "#/components/schemas/ApiRoomDTO"
      security:
      - OAuthLogin: []
  /rest/v1/roomrates/{accommodation}/{id}:
    patch:
      tags:
      - "ARI: Rooms & Rates"
      summary: Update the specified room or a rate
      externalDocs:
        description: Documentation for Room and Rates
        url: https://community.octorate.com/search?query=room%20and%20rates
      operationId: updateRoom
      parameters:
      - name: accommodation
        in: path
        required: true
        schema:
          type: string
      - name: id
        in: path
        required: true
        schema:
          type: integer
          format: int64
      requestBody:
        description: "The unit to create in octorate, could be a basic room or a derived\
          \ rate"
        content:
          application/json:
            schema:
              type: string
        required: true
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "500":
          description: "Internal Server Error, something bad occourend on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: Product Form Processed
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ApiRoomDTO"
              examples:
                A small request:
                  description: A small request
                  value:
                    adults: 5
                Change derived rule:
                  description: Change derived rule
                  value: "{\"derivedRule\": {\"availability\":false}}}"
        "304":
          description: "Not Modified (empty response): The content you've present\
            \ excluding required fields doesn't change anything inside Octorate."
      security:
      - OAuthLogin: []
  /rest/v2/accommodation/{accommodation}/changeAdminUserAccess:
    patch:
      tags:
      - "Property: Accommodations"
      description: Authorize or revoke administrators access to the accommodation
        users
      operationId: changeAdminUserAccess
      parameters:
      - name: accommodation
        in: path
        required: true
        schema:
          type: string
      - name: value
        in: query
        description: "true to authorize admins, false to revoke"
        required: true
        schema:
          type: boolean
      responses:
        default:
          description: default response
          content:
            application/json: {}
  /rest/v2/accommodation/{accommodation}/changeGoodMorningEmail:
    patch:
      tags:
      - "Property: Accommodations"
      description: Activate or deactivate good morning email
      operationId: changeGoodMorningEmail
      parameters:
      - name: accommodation
        in: path
        required: true
        schema:
          type: string
      - name: value
        in: query
        description: Good morning email boolean value
        required: true
        schema:
          type: boolean
      responses:
        default:
          description: default response
          content:
            '*/*': {}
  /rest/v2/accommodation/{accommodation}/changeRatePlanCross:
    patch:
      tags:
      - "Property: Accommodations"
      description: Activate or deactivate rate plan cross
      operationId: changeRatePlanCross
      parameters:
      - name: accommodation
        in: path
        required: true
        schema:
          type: string
      - name: value
        in: query
        description: Rate plan cross boolean value
        required: true
        schema:
          type: boolean
      responses:
        default:
          description: default response
          content:
            '*/*': {}
  /rest/v2/accommodation:
    post:
      tags:
      - "Property: Accommodations"
      operationId: createAccommodation
      requestBody:
        description: Accommodation Form in json form
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ApiAccommodationDTO"
            examples:
              Minimum required data:
                description: Minimum required data
                value:
                  zip: "00012"
                  city: Roma
                  givenName: Oscar
                  familyName: Slim Dogg T
                  name: Surf House Lisboa
                  latitude: 12.12
                  longitude: 15.15
                  currency: EUR
                  email: myname@mycompany.com
                  isoCountry: FR
              Full request:
                description: Full request
                value:
                  zip: "12222"
                  city: Roma
                  timeZone: Europe/Rome
                  givenName: Oscar
                  familyName: Slim Dogg T
                  name: Surf House Lisboa
                  latitude: 42.12
                  longitude: 44.22
                  currency: EUR
                  email: myname@mycompany.com
                  phone: "+393376543321"
                  address: Avenida da Liberdade 12
                  accept_duplicates: true
                  propertyCategory: OTHER
                  cod_promo: PROMO50
                  isoCountry: FR
      responses:
        "412":
          description: "PRECONDITION_FAILED: Optionally check accept_duplicates flagged\
            \ as false and another account with same email existing"
          content:
            application/json:
              examples:
                Precondition Failed:
                  description: Precondition Failed
                  value:
                    status: existing
                    id: "219642"
        "400":
          description: Access Denied to network
          content:
            application/json:
              examples:
                Access to network denied:
                  description: Access to network denied
                  value:
                    element: $.networkName
                    message: Master account not found or invalid
                    nested: []
                    type: ApiParamsExemption
        "200":
          description: Property created
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ApiAccommodationResponse"
              examples:
                Response for OAuth:
                  description: Please note that you will get a NEW refresh token inside
                    the response that will allow you to retrieve the access token
                    using the Identity Refresh method in this documentation. Property
                    ID is the id in this response
                  value:
                    status: CREATED_ACCOMMODATION
                    id: "16997"
                    refresh_token: ffd74562fd6d401485d156db0e0810e6ML
                Registering a new property in the network (using network_name):
                  description: "In case you want to create and register a property\
                    \ in the network, you can do using the network name here.In this\
                    \ case you will get the same refresh token with that property\
                    \ added."
                  value:
                    status: created
                    id: "323218"
                    refresh_token: ffd74562fd6d401485d156db0e0810e6ML
                    refresh_properties:
                    - "142322"
                    - "282380"
                    - "323218"
      security:
      - ApiOperations: []
  /rest/v2/accommodation/{accommodation}/mappedRooms:
    get:
      tags:
      - "Property: Accommodations"
      summary: Return true if the accommodation has mapped rooms
      description: Return true if the accommodation has mapped room
      operationId: getMappedRooms
      parameters:
      - name: accommodation
        in: path
        description: Accommodation Id
        required: true
        schema:
          type: string
      responses:
        "200":
          description: "Standard response for successful HTTP requests. The actual\
            \ response will depend on the request method used. In a GET request, the\
            \ response will contain an entity corresponding to the requested resource.\
            \ In a POST request the response will contain an entity describing or\
            \ containing the result of the action."
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/ApiExternalRoomDTO"
              examples:
                example of response:
                  description: example of response
                  value:
                    data:
                    - createTime: "2018-11-22T11:13:00Z[UTC]"
                      id: 523833
                      manageable: true
                      occupancy: 4
                      pmsRoom: false
                      rateId: "3101"
                      rateName: Not Refundable without breakfast
                      referenceId: 3758:3101
                      roomId: "3758"
                      roomName: Appartamento la Torretta per 4 persone
      security:
      - OAuthLogin:
        - api_connection_read
  /rest/v2/accommodation/{accommodation}:
    patch:
      tags:
      - "Property: Accommodations"
      description: Update an existing accommodation
      operationId: updateAccommodation
      parameters:
      - name: accommodation
        in: path
        description: "Accommodation id, should be part of your network"
        required: true
        schema:
          type: string
      requestBody:
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ApiAccommodationDTO"
      responses:
        "200":
          description: Property update
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ApiAccommodationDTO"
        "304":
          description: "Not Modified: Property not updated because the content is\
            \ equals to octorate content or empty mandatory fields was skipped. NO\
            \ CONTENT is provided in this case"
      security:
      - ApiOperations: []
  /rest/v2/checkin/{accommodation}/{id}/guest:
    post:
      tags:
      - "Property: Checkins"
      description: Create a new Guest inside the reservation. Guest here is the detailed
        information retrieved during the checkin and usually send to police
      operationId: createGuest
      parameters:
      - name: id
        in: path
        description: Reservation ID (Octorate ID)
        required: true
        schema:
          type: integer
          format: int64
      - name: accommodation
        in: path
        description: Property ID (Octorate ID)
        required: true
        schema:
          type: string
      requestBody:
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ApiReservationGuestDTO"
            example:
              checkin: 1977-11-26
              checkout: 1972-01-04
              familyName: Rossi
              givenName: Mario
              type: GUEST
              accommodatedType: null
              birthDate: 2015-11-05
              birthCountry: IT
              birthCity: ROMA
              residenceCountry: IT
              residenceCity: Roma
              citizenship: IT
              city: Roma
              email: myname@mycompany.com
              phone: minim tempor
              address: "15th Street, Manhattan, New York"
              zipCode: "00022"
              language: IT
              nationality: IT
              documentCode: AS3332DC
              documentType: Passport
              documentIssueDate: 1971-02-18
              documentIssuePlace: Roma
              documentExpire: 2022-11-29T08:10:28
              sex: MALE
      responses:
        "200":
          description: Sucess
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ApiReservationGuestDTO"
  /rest/v2/checkin/{accommodation}/tags:
    get:
      tags:
      - "Property: Checkins"
      summary: Get checkin tags
      description: Returns tags available for the accommodation.
      operationId: getCheckinTags
      parameters:
      - name: accommodation
        in: path
        description: Accommodation ID
        required: true
        schema:
          type: string
      responses:
        "200":
          description: Tags returned
  /rest/v2/checkin/city/{country}:
    get:
      tags:
      - "Property: Checkins"
      summary: Get cities of a country
      description: Returns all cities mapped for the specified country code.
      operationId: getCountryCity
      parameters:
      - name: country
        in: path
        description: "Country code (IT, ES, FR...)"
        required: true
        schema:
          type: string
      responses:
        "200":
          description: Cities returned
  /rest/v2/checkin/documents/{accommodation}:
    get:
      tags:
      - "Property: Checkins"
      summary: Get document types
      description: Returns the list of all document types accepted by the specified
        accommodation.
      operationId: getCountryDocuments
      parameters:
      - name: accommodation
        in: path
        description: Accommodation ID
        required: true
        schema:
          type: string
      responses:
        "200":
          description: List returned
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/PoliceDocumentTypeCountry"
  /rest/v2/invoice/{codice}/{refer}/createDoubleHeadingInvoice:
    post:
      tags:
      - "Property: Invoices"
      description: Creates double billing from a reservation and sends the receipts/invoices
        to owner and guest.
      operationId: createDoubleHeadingInvoice
      parameters:
      - name: refer
        in: path
        required: true
        schema:
          type: string
      - name: codice
        in: path
        required: true
        schema:
          type: string
      - name: sendMailReceiptOwnercc
        in: query
        schema:
          type: boolean
      - name: sendMailReceiptGuestcc
        in: query
        schema:
          type: boolean
      - name: sendMailInvoiceGuestcc
        in: query
        schema:
          type: boolean
      responses:
        default:
          description: default response
          content:
            '*/*': {}
  /rest/v2/invoice/pdf/{accommodationId}/summary/{idDocumentEncrypted}:
    get:
      tags:
      - "Property: Invoices"
      description: Download the PDF of a persisted summary document
      operationId: downloadSummaryDocument
      parameters:
      - name: accommodationId
        in: path
        required: true
        schema:
          type: string
      - name: idDocumentEncrypted
        in: path
        required: true
        schema:
          type: string
      - name: language
        in: query
        schema:
          type: string
          enum:
          - IT
          - EN
          - FR
          - ES
          - DE
          - RU
          - PT
          - NL
          - JA
          - EL
          - TR
          - ZH
          - CA
          - RO
      responses:
        default:
          description: default response
          content:
            application/pdf: {}
  /rest/v2/invoice/{codice}:
    get:
      tags:
      - "Property: Invoices"
      description: Read the invoices
      operationId: getInvoices
      parameters:
      - name: fields
        in: query
        required: true
        schema:
          type: string
      - name: "ids[]"
        in: query
        description: List of IDs of specific invoices. The search is exclusive in
          this case
        schema:
          type: array
          items:
            type: integer
            format: int64
      - name: "reservations[]"
        in: query
        description: List of IDs of specific reservation rooms.
        schema:
          type: array
          items:
            type: integer
            format: int64
      - name: "reservationRefers[]"
        in: query
        description: List of refers of reservations.
        schema:
          type: array
          items:
            type: string
      - name: customer
        in: query
        description: Search by customer name
        schema:
          type: string
      - name: dateType
        in: query
        description: Change the type of date search.
        schema:
          type: string
          enum:
          - TODAY
          - YESTERDAY
          - LAST_SIXTY_DAYS
          - MONTH
          - PREVIOUS_MONTH
          - LAST_THREE_MONTHS
          - LAST_SIX_MONTHS
          - THIS_YEAR
          - PREVIOUS_YEAR
          - LAST_TWO_YEARS
          - ALL
        example: TODAY
      - name: startDate
        in: query
        description: Date in format yyyy-MM-dd. Result depends on date type. For format
          yyyy-MM-dd date is always considered Rome Time
        schema:
          type: string
          format: date
        example: 2020-01-01
      - name: endDate
        in: query
        description: Date in format yyyy-MM-dd. Result depends on date type. For format
          yyyy-MM-dd date is always considered Rome Time
        schema:
          type: string
          format: date
        example: 2020-01-01
      - name: "documentTypes[]"
        in: query
        description: "The list of document types to include, you can use multiple\
          \ values repeating documentTypes[]=INVOICE&documentTypes[]=PROFORMA"
        schema:
          type: array
          items:
            type: string
            enum:
            - PROFORMA
            - INVOICE
            - FISCALRECEIPT
            - GENERICRECEIPT
            - CREDIT_NOTE
            - CORRECTING_INVOICE
            - SIMPLIFIED_INVOICE
            - SUMMARY_DOCUMENT
        example: "INVOICE,RECEIPT"
      - name: paid
        in: query
        description: "Filter by payment status. true for paid invoices only, false\
          \ for unpaid or partially paid invoices."
        schema:
          type: boolean
      - name: expired
        in: query
        description: "Filter by expire status. true for expired invoices only, false\
          \ for unexpired invoices."
        schema:
          type: boolean
      - name: fiscalInvoiceGroup
        in: query
        description: Filter by the fiscal status. Use only if integration with treasury
          is active on the accommodation.
        schema:
          type: string
          enum:
          - EMPTY
          - REJECTED_BEFORE
          - BEFORE_SDI
          - SDI_PROCESSING
          - SDI_REJECTED
          - DONE
      - name: autoinvoice
        in: query
        description: "Filter by autoinvoice status. true for autoinvoices only, false\
          \ for normal invoices."
        schema:
          type: boolean
      - name: passive
        in: query
        description: "Describe the flow of the invoice, normally is 'ACTIVE', it means\
          \ the accommodation is invoicing i.e. a guest. Passive = true means this\
          \ invoice has been received by the property"
        schema:
          type: boolean
          default: false
      - name: invoiceQuery
        in: query
        description: Search by customer name or invoice number
        schema:
          type: string
      - name: fields
        in: query
        description: "List of fields to filter in the response. Can be usefull to\
          \ save bandwith and get quicker response from this server. Values are separated\
          \ by comma, only applies to the first level, like this: 'checkin, guests'"
        schema:
          type: string
      - name: size
        in: query
        description: 'How many results per page? '
        schema:
          maximum: 200
          minimum: 1
          type: integer
          format: int32
          default: 20
      - name: page
        in: query
        description: Page number of the results
        schema:
          maximum: 1000
          minimum: 0
          type: integer
          format: int32
      - name: sort
        in: query
        schema:
          type: string
          enum:
          - ID
          - DOCUMENT_DATE
          - ACCOMMODATION
          - DOCUMENT_TYPE
          - NUMBER
          - CUSTOMER
          - GROSS_AMOUNT
      - name: sortOrder
        in: query
        schema:
          type: string
          enum:
          - ASC
          - DESC
      - name: codice
        in: path
        required: true
        schema:
          type: string
      responses:
        default:
          description: default response
          content:
            application/json: {}
  /rest/v2/invoice/{accommodationId}/summary/{refer}:
    post:
      tags:
      - "Property: Invoices"
      description: "Create and persist a summary document for a reservation, return\
        \ download URL"
      operationId: issueSummaryDocument
      parameters:
      - name: accommodationId
        in: path
        required: true
        schema:
          type: string
      - name: refer
        in: path
        required: true
        schema:
          type: string
      responses:
        default:
          description: default response
          content:
            application/json: {}
  /rest/v2/roomrates/{accommodation}/copy:
    post:
      tags:
      - "ARI: Rooms & Rates"
      summary: Manage rooms - Copy rooms
      externalDocs:
        description: Documentation for Room and Rates
        url: https://community.octorate.com/search?query=room%20and%20rates
      operationId: copy
      parameters:
      - name: accommodation
        in: path
        required: true
        schema:
          type: string
      requestBody:
        description: Body content to specify details for operation
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ApiRoomManagementDTO"
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "500":
          description: "Internal Server Error, something bad occourend on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: Operation completed successfully
  /rest/v2/roomrates/{accommodation}/connections:
    get:
      tags:
      - "ARI: Rooms & Rates"
      summary: Retrieve rooms connections
      externalDocs:
        description: Documentation for Room and Rates
        url: https://community.octorate.com/search?query=room%20and%20rates
      operationId: getConnections
      parameters:
      - name: accommodation
        in: path
        required: true
        schema:
          type: string
      - name: "ids[]"
        in: query
        description: "Only if you need, you can filter by one or many specific ID,\
          \ setting up multiple times the param ids[] "
        schema:
          type: array
          items:
            type: integer
            format: int64
      - name: page
        in: query
        schema:
          type: integer
          format: int32
      - name: size
        in: query
        schema:
          type: integer
          format: int32
      - name: includeRms
        in: query
        schema:
          type: boolean
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "500":
          description: "Internal Server Error, something bad occourend on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: Processed
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/ApiRoomDTO"
  /rest/v2/roomrates/{accommodation}:
    get:
      tags:
      - "ARI: Rooms & Rates"
      summary: Retrieve property rooms and rates
      description: "Through this call you can retrieve all the Inventory of Octorate\
        \ platform. <br/>Please take note, we consider both typology or rate as products.\
        \ We don't yet allow to separate them and mixing after. <br/>We define the\
        \ relationship between these products using the field derivedRule where you\
        \ can setup the relationship between the current object and the parent (i.e.\
        \ +5 eur, follow avail,etc..) <br/><b>We strongly suggest you to have also\
        \ a look to the backoffice of the user to understand better how this products\
        \ are linked. </b> <br/>New accommodation or new product for an apartment?\
        \ All depends on where the linked services should be located. I.e. we support\
        \ sending statistical data and sending information to the police setting up\
        \ only one credential for accommodation. If you're sure that all the products\
        \ belongs to the same configuration you can set up them inside the same property\
        \ (An example might be defining the building, with always the same external\
        \ credentials, and inside the single apartment as products)  <b> Migrating\
        \ from V1? </b> We've changed the amenity model to introduce some more details,\
        \ We've also introduced the read-only field 'images' to speed up your development "
      externalDocs:
        description: Documentation for Room and Rates
        url: https://community.octorate.com/search?query=room%20and%20rates
      operationId: getListings
      parameters:
      - name: accommodation
        in: path
        required: true
        schema:
          type: string
      - name: fields
        in: query
        description: "List of fields to filter in the response. Can be usefull to\
          \ save bandwith and get quicker response from this server. Values are separated\
          \ by comma, only applies to the first level, like this: 'id, name'"
        schema:
          type: string
        example: "id,name"
      - name: "ids[]"
        in: query
        description: "Only if you need, you can filter by one or many specific ID,\
          \ setting up multiple times the param ids[] "
        schema:
          type: array
          items:
            type: integer
            format: int64
      - name: page
        in: query
        schema:
          type: integer
          format: int32
      - name: size
        in: query
        schema:
          type: integer
          format: int32
      - name: includeRms
        in: query
        schema:
          type: boolean
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "500":
          description: "Internal Server Error, something bad occourend on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: Processed
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/ApiRoomDTO"
  /rest/v2/roomrates/{accommodation}/move:
    post:
      tags:
      - "ARI: Rooms & Rates"
      summary: Manage rooms - Move rooms
      externalDocs:
        description: Documentation for Room and Rates
        url: https://community.octorate.com/search?query=room%20and%20rates
      operationId: move_1
      parameters:
      - name: accommodation
        in: path
        required: true
        schema:
          type: string
      requestBody:
        description: Body content to specify details for operation
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ApiRoomManagementDTO"
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "500":
          description: "Internal Server Error, something bad occourend on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: Operation completed successfully
  /rest/v2/roomrates/{accommodation}/runRules:
    post:
      tags:
      - "ARI: Rooms & Rates"
      summary: Run rules for a list of rooms
      externalDocs:
        description: Documentation for Room and Rates
        url: https://community.octorate.com/search?query=room%20and%20rates
      operationId: runRules
      parameters:
      - name: accommodation
        in: path
        required: true
        schema:
          type: string
      requestBody:
        description: Body content to specify the list of the rooms
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ApiRoomManagementBasicDTO"
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "500":
          description: "Internal Server Error, something bad occourend on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: Operation completed successfully
  /rest/v2/roomrates/{accommodationId}/{roomRateId}:
    patch:
      tags:
      - "ARI: Rooms & Rates"
      description: Update the room rate
      externalDocs:
        description: Documentation for Room and Rates
        url: https://community.octorate.com/search?query=room%20and%20rates
      operationId: update the room rate
      parameters:
      - name: accommodationId
        in: path
        required: true
        schema:
          type: string
      - name: roomRateId
        in: path
        required: true
        schema:
          type: integer
          format: int64
      requestBody:
        content:
          application/json:
            schema:
              type: string
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "500":
          description: "Internal Server Error, something bad occourend on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
  /rest/v3/roomrates/{accommodation}/copy:
    post:
      tags:
      - "ARI: Rooms & Rates"
      summary: Manage rooms - Copy rooms
      externalDocs:
        description: Documentation for Room and Rates
        url: https://community.octorate.com/search?query=room%20and%20rates
      operationId: copyV3
      parameters:
      - name: accommodation
        in: path
        required: true
        schema:
          type: string
      requestBody:
        description: Body content to specify details for operation
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ApiRoomManagementDTO"
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "500":
          description: "Internal Server Error, something bad occourend on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: Operation completed successfully
  /rest/v3/roomrates/{accommodation}:
    get:
      tags:
      - "ARI: Rooms & Rates"
      summary: Retrieve property rooms and rates
      description: "Through this call you can retrieve all the Inventory of Octorate\
        \ platform. <br/>Please take note, we consider both typology or rate as products.\
        \ We don't yet allow to separate them and mixing after. <br/>We define the\
        \ relationship between these products using the field derivedRule where you\
        \ can setup the relationship between the current object and the parent (i.e.\
        \ +5 eur, follow avail,etc..) <br/><b>We strongly suggest you to have also\
        \ a look to the backoffice of the user to understand better how this products\
        \ are linked. </b> <br/>New accommodation or new product for an apartment?\
        \ All depends on where the linked services should be located. I.e. we support\
        \ sending statistical data and sending information to the police setting up\
        \ only one credential for accommodation. If you're sure that all the products\
        \ belongs to the same configuration you can set up them inside the same property\
        \ (An example might be defining the building, with always the same external\
        \ credentials, and inside the single apartment as products)  <b> Migrating\
        \ from V1? </b> We've changed the amenity model to introduce some more details,\
        \ We've also introduced the read-only field 'images' to speed up your development "
      externalDocs:
        description: Documentation for Room and Rates
        url: https://community.octorate.com/search?query=room%20and%20rates
      operationId: getListingsV3
      parameters:
      - name: accommodation
        in: path
        required: true
        schema:
          type: string
      - name: fields
        in: query
        description: "List of fields to filter in the response. Can be usefull to\
          \ save bandwith and get quicker response from this server. Values are separated\
          \ by comma, only applies to the first level, like this: 'id, name'"
        schema:
          type: string
        example: "id,name"
      - name: "ids[]"
        in: query
        description: "Only if you need, you can filter by one or many specific ID,\
          \ setting up multiple times the param ids[] "
        schema:
          type: array
          items:
            type: integer
            format: int64
      - name: page
        in: query
        schema:
          type: integer
          format: int32
      - name: size
        in: query
        schema:
          type: integer
          format: int32
      - name: includeRms
        in: query
        schema:
          type: boolean
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "500":
          description: "Internal Server Error, something bad occourend on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: Processed
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/ApiRoomDTO"
    post:
      tags:
      - "ARI: Rooms & Rates"
      summary: create a room or a rate
      externalDocs:
        description: Documentation for Room and Rates
        url: https://community.octorate.com/search?query=room%20and%20rates
      operationId: createRoomRateV3
      parameters:
      - name: accommodation
        in: path
        required: true
        schema:
          type: string
      requestBody:
        description: "The unit to create in octorate, could be a basic room or a derived\
          \ rate"
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ApiRoomRateDTOV3"
        required: true
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "500":
          description: "Internal Server Error, something bad occourend on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: Processed
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/ApiItemResponse"
              examples:
                Successfully processed:
                  description: Successfully processed
                  value:
                    data:
                    - id: 207677
                      name: TEST EXTRA
                      accommodation:
                        currency: EUR
                        id: "112696"
                        name: La Pergola di Venezia
                        timeZone: Europe/Rome
                      enabled: false
                      mandatory: false
                      refundable: false
                      basePrice: 0.0
                      description: {}
                      model: BOOKING
                      taxPercent: 0.0
                      title: {}
                    - id: 207678
                      name: TEST EXTRA
                      accommodation:
                        currency: EUR
                        id: "112696"
                        name: La Pergola di Venezia
                        timeZone: Europe/Rome
                      enabled: false
                      mandatory: false
                      refundable: false
                      basePrice: 0.0
                      description: {}
                      model: BOOKING
                      taxPercent: 0.0
                      title: {}
      security:
      - OAuthLogin: []
  /rest/v3/roomrates/{accommodation}/connections:
    get:
      tags:
      - "ARI: Rooms & Rates"
      summary: Retrieve rooms connections
      externalDocs:
        description: Documentation for Room and Rates
        url: https://community.octorate.com/search?query=room%20and%20rates
      operationId: getConnectionsV3
      parameters:
      - name: accommodation
        in: path
        required: true
        schema:
          type: string
      - name: "ids[]"
        in: query
        description: "Only if you need, you can filter by one or many specific ID,\
          \ setting up multiple times the param ids[] "
        schema:
          type: array
          items:
            type: integer
            format: int64
      - name: page
        in: query
        schema:
          type: integer
          format: int32
      - name: size
        in: query
        schema:
          type: integer
          format: int32
      - name: includeRms
        in: query
        schema:
          type: boolean
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "500":
          description: "Internal Server Error, something bad occourend on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: Processed
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/ApiRoomDTO"
  /rest/v3/roomrates/{accommodation}/move:
    post:
      tags:
      - "ARI: Rooms & Rates"
      summary: Manage rooms - Move rooms
      externalDocs:
        description: Documentation for Room and Rates
        url: https://community.octorate.com/search?query=room%20and%20rates
      operationId: moveV3
      parameters:
      - name: accommodation
        in: path
        required: true
        schema:
          type: string
      requestBody:
        description: Body content to specify details for operation
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ApiRoomManagementDTO"
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "500":
          description: "Internal Server Error, something bad occourend on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: Operation completed successfully
  /rest/v3/roomrates/{accommodation}/runRules:
    post:
      tags:
      - "ARI: Rooms & Rates"
      summary: Run rules for a list of rooms
      externalDocs:
        description: Documentation for Room and Rates
        url: https://community.octorate.com/search?query=room%20and%20rates
      operationId: runRulesV3
      parameters:
      - name: accommodation
        in: path
        required: true
        schema:
          type: string
      requestBody:
        description: Body content to specify the list of the rooms
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ApiRoomManagementBasicDTO"
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "500":
          description: "Internal Server Error, something bad occourend on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: Operation completed successfully
  /rest/v3/roomrates/{accommodation}/{roomid}/translateMissingDescriptions/{language}:
    patch:
      tags:
      - "ARI: Rooms & Rates"
      description: Translate the missing descriptions of the room reading from the
        provided language
      externalDocs:
        description: Documentation for Room and Rates
        url: https://community.octorate.com/search?query=room%20and%20rates
      operationId: translateMissingDescriptionsV3
      parameters:
      - name: accommodation
        in: path
        required: true
        schema:
          type: string
      - name: roomid
        in: path
        required: true
        schema:
          type: integer
          format: int64
      - name: language
        in: path
        required: true
        schema:
          type: string
          enum:
          - IT
          - EN
          - FR
          - ES
          - DE
          - RU
          - PT
          - NL
          - JA
          - EL
          - TR
          - ZH
          - CA
          - RO
      requestBody:
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ApiRoomRateDTOV3"
        required: true
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "500":
          description: "Internal Server Error, something bad occourend on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: Processed
          content:
            '*/*':
              schema:
                $ref: "#/components/schemas/ApiRoomRateDTOV3"
      security:
      - OAuthLogin: []
  /rest/v3/roomrates/{accommodation}/{id}:
    patch:
      tags:
      - "ARI: Rooms & Rates"
      summary: Update the specified room or a rate
      externalDocs:
        description: Documentation for Room and Rates
        url: https://community.octorate.com/search?query=room%20and%20rates
      operationId: updateRoomV3
      parameters:
      - name: accommodation
        in: path
        required: true
        schema:
          type: string
      - name: id
        in: path
        required: true
        schema:
          type: integer
          format: int64
      requestBody:
        description: "The unit to create in octorate, could be a basic room or a derived\
          \ rate"
        content:
          application/json:
            schema:
              type: string
        required: true
      responses:
        "400":
          description: Invalid Request
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "401":
          description: There is something wrong with you api key
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "403":
          description: Access to the resource is forbidden
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "500":
          description: "Internal Server Error, something bad occourend on Octorate\
            \ side"
          headers:
            X-RateLimit-Remaining:
              description: Current remaining calls of your api key
              style: simple
              schema:
                description: Current remaining calls of your api key
                example: 99
            request-id:
              description: "Identifier of your request, for Octorate inquiries"
              style: simple
              schema:
                description: Id for octorate support inquiries
                example: 99eba45f-3cf8-4f50-bba8-8ccd37a1aff5
        "200":
          description: Product Form Processed
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ApiRoomDTO"
              examples:
                A small request:
                  description: A small request
                  value:
                    adults: 5
                Change derived rule:
                  description: Change derived rule
                  value: "{\"derivedRule\": {\"availability\":false}}}"
        "304":
          description: "Not Modified (empty response): The content you've present\
            \ excluding required fields doesn't change anything inside Octorate."
      security:
      - OAuthLogin: []
components:
  schemas:
    ApiConfigurationReseller:
      type: object
      properties:
        reseller:
          type: boolean
          description: Describe if this api is linked to a reseller account (blue
            area)
          readOnly: true
        permUpgrade:
          type: boolean
          description: Describe if reseller menu is active for all users
          readOnly: true
        permOwners:
          type: boolean
          description: Describe if this reseller is handling property owners
          readOnly: true
        resellerName:
          type: string
          description: The name of this reseller
          readOnly: true
        resellerEmail:
          type: string
          description: The reseller email
          readOnly: true
        codPromo:
          type: string
          description: Code that can be used to join accommodation by commercial
          readOnly: true
      description: "Information about the linked reseller account. If you are a reseller\
        \ of Octorate, contact Octorate to have your account linked."
    ApiConfigurationResponse:
      type: object
      properties:
        environment:
          type: string
          description: "The enabled environment, you can use 'SANDBOX' or 'PRODUCTION'"
        redirectUri:
          type: array
          description: List of allowed redirect uri for your application. They should
            start with 'https://' (secure). All the links will be replaced with the
            new object. Set null to remove
          items:
            type: string
            description: List of allowed redirect uri for your application. They should
              start with 'https://' (secure). All the links will be replaced with
              the new object. Set null to remove
        category:
          type: string
          description: "Your api category, can be one of CHECKIN_PROVIDER,BOOKING_ENGINE,CHANNEL_MANAGER,OTA"
          enum:
          - CHECKIN_PROVIDER
          - BOOKING_ENGINE
          - CHANNEL_MANAGER
          - OTA
          - RMS
          - MODEL_CONTEXT_PROTOCOL
        icon:
          type: string
          description: "Writable field for you icon. In writing mode set here the\
            \ icon to download, in read mode you will see our imported name."
        secretVisibility:
          type: boolean
          description: "Set true to show this API to all the user, set FALSE if you\
            \ expect to initiate the connection on your side (We will not show your\
            \ api in available ones)"
        applicationName:
          type: string
          description: Application name that will be shown to customer
          example: My Awesome application
        description:
          $ref: "#/components/schemas/LanguageMap"
        active:
          type: boolean
          description: Whether you api key is active
          readOnly: true
        authMethod:
          type: string
          description: Authentication method of your Api access
        authorizationPages:
          type: array
          description: "Octorate Identity page: Where you should redirect the user\
            \ to ask for grant"
          items:
            type: string
            description: "Octorate Identity page: Where you should redirect the user\
              \ to ask for grant"
        quotaLimit:
          type: integer
          description: Your current quota limit
          format: int64
        quotaStatus:
          type: integer
          description: The remaining calls for that api access
          format: int64
        reseller:
          $ref: "#/components/schemas/ApiConfigurationReseller"
        permissions:
          $ref: "#/components/schemas/ApiPermission"
        configName:
          type: string
          description: The current configuration name
        uniqueId:
          type: string
          description: The current configuration unique id
        buildNumber:
          type: string
          description: The current configuration build number
        maintenance:
          type: boolean
          description: True if this is a maintenance mode
        fiscalVersion:
          type: string
          description: "Fiscal version, compliant with NF525 certification"
      readOnly: true
    ApiPermission:
      type: object
      properties:
        accommodation:
          type: string
          enum:
          - NONE
          - READWRITE
          - READONLY
        license:
          type: string
          enum:
          - NONE
          - READWRITE
          - READONLY
        cardDetail:
          type: string
          enum:
          - NONE
          - READWRITE
          - READONLY
        content:
          type: string
          enum:
          - NONE
          - READWRITE
          - READONLY
        reservation:
          type: string
          enum:
          - NONE
          - READWRITE
          - READONLY
      description: Action authorized for your application
    LanguageMap:
      type: object
      properties:
        emptyValues:
          type: boolean
        empty:
          type: boolean
      additionalProperties:
        type: string
        example: "{\"EN\":\"These are the LanguageMap value in English!\"}"
        default: "{\"EN\":\"These are the access rule in English!\"}"
      example:
        EN: These are the LanguageMap value in English!
      default:
        EN: These are the access rule in English!
    ApiConfigurationRequest:
      type: object
      properties:
        environment:
          type: string
          description: "The enabled environment, you can use 'SANDBOX' or 'PRODUCTION'"
        redirectUri:
          type: array
          description: List of allowed redirect uri for your application. They should
            start with 'https://' (secure). All the links will be replaced with the
            new object. Set null to remove
          items:
            type: string
            description: List of allowed redirect uri for your application. They should
              start with 'https://' (secure). All the links will be replaced with
              the new object. Set null to remove
        category:
          type: string
          description: "Your api category, can be one of CHECKIN_PROVIDER,BOOKING_ENGINE,CHANNEL_MANAGER,OTA"
          enum:
          - CHECKIN_PROVIDER
          - BOOKING_ENGINE
          - CHANNEL_MANAGER
          - OTA
          - RMS
          - MODEL_CONTEXT_PROTOCOL
        icon:
          type: string
          description: "Writable field for you icon. In writing mode set here the\
            \ icon to download, in read mode you will see our imported name."
        secretVisibility:
          type: boolean
          description: "Set true to show this API to all the user, set FALSE if you\
            \ expect to initiate the connection on your side (We will not show your\
            \ api in available ones)"
        applicationName:
          type: string
          description: Application name that will be shown to customer
          example: My Awesome application
        description:
          $ref: "#/components/schemas/LanguageMap"
      description: Configure your application
    ApiPortalDTOResp:
      required:
      - banner
      - contentMetas
      - externalName
      - id
      - internalName
      - loginUrl
      - requiresHotelId
      - website
      type: object
      properties:
        internalName:
          type: string
          description: string id for your api
          example: "Your api name with underscore: i.e. my_api_name"
        externalName:
          type: string
          description: public name of your api
          example: Booking.com
        calendarValues:
          type: array
          description: "List of manageable values (only if restricted). If you need\
            \ to have the prices back, please fill at least one of these value and\
            \ subscribe to price webhooks."
          items:
            type: string
            description: "List of manageable values (only if restricted). If you need\
              \ to have the prices back, please fill at least one of these value and\
              \ subscribe to price webhooks."
            enum:
            - PRICE
            - AVAILABILITY
            - MINSTAY
            - MAXSTAY
            - CLOSEARR
            - CLOSEDEP
            - STOPSELL
            - CUTOFF
        colorHex:
          type: string
          description: Color inside the Octorate Calendar
          example: c5c5c5
        logo:
          type: string
          description: 'Logo Inside Octorate (file name). Ignored if you don''t pass
            it when we already have it. '
          example: "To Write: https://www.mywebsite.com/myimage.jpg, In reading: 123432434234.jpg"
        icon:
          type: string
          description: 'Icon Inside Octorate (file name). Ignored if you don''t pass
            it when we already have it. '
          example: "To Write: https://www.mywebsite.com/myimage.jpg, In reading: 123432434234.jpg"
        banner:
          type: string
          description: Banner to show inside octorate (rectangle horizontal format).
            Ignored if you don't pass it when we already have it.
        loginUrl:
          type: string
          description: Login url inside the backoffice of the OTA sites
          example: myapp.com/backoffice/
        requiresHotelId:
          type: boolean
          description: "The connection to this OTA requires the Hotel ID. <br/> In\
            \ detail, what's the hotel id? <br/> It's a param we use to identify the\
            \ accommodation inside the external portal.  For Vacation Rental we normally\
            \ set here the user id of the connection. We use it to group connections\
            \ since, if we discovered that for instance the same connection hotel\
            \ id is repeated in multiple accommodation we may choose to send only\
            \ one discount to that portal instead of repeating it or we may choose\
            \ to copy some data (i.e. access token) if the connection shares this\
            \ id"
        requiresPassword:
          type: boolean
          description: The OTA requires to use a valid username AND password to connect
            to their services
        requiresTokenAuthentication:
          type: boolean
          description: The OTA requires to use a flow to retrieve an access token
            (i.e. OAuth) since this portal supports user based authentication.
        website:
          type: string
          description: Website of the OTA company
          example: www.booking.com
        contentMetas:
          type: array
          description: "List of content meta values manageable from this portal. Setting\
            \ this value for your OTA connection and setting up the content webhooks\
            \ will show your ota connection inside the list. <br/>Otherwise, explicitly\
            \ set it as null will remove the connection from the sites marked as content\
            \ related <br/>Leave empty (without specifing null) if you don't need\
            \ to touch it, otherwise fill always with your expected data (explicitly\
            \ set this field to NULL to clear everything)"
          items:
            type: string
            description: "List of content meta values manageable from this portal.\
              \ Setting this value for your OTA connection and setting up the content\
              \ webhooks will show your ota connection inside the list. <br/>Otherwise,\
              \ explicitly set it as null will remove the connection from the sites\
              \ marked as content related <br/>Leave empty (without specifing null)\
              \ if you don't need to touch it, otherwise fill always with your expected\
              \ data (explicitly set this field to NULL to clear everything)"
        id:
          type: integer
          description: Reference inside our system
          format: int64
          example: 4
        creatable:
          type: boolean
          description: This portal is enabled for user. This means that the user can
            add this connection
          example: true
        featureContent:
          type: boolean
          description: If true means that this portal is capable of handle the content
          example: true
        featureContentRate:
          type: boolean
          description: "If true means that this portal, when handling content requires\
            \ also rate information"
          example: false
        octorateManageable:
          type: boolean
          description: If true this portal follows Octorate availability and cancellations.
          example: true
        showFilter:
          type: boolean
          description: If true this portal should be shown in filter lists.
          example: true
        commissionsInvoiced:
          type: boolean
          deprecated: true
        commissionIncludedInPayments:
          type: boolean
          description: "Portal-level default for commission handling. When true the\
            \ OTA commission is included in the payment amount (Hotel Collect: the\
            \ hotel collects the full price from the guest). When false the OTA has\
            \ already deducted its commission (Company Collect: the OTA collects the\
            \ payment). Can be overridden per-reservation via CompanyCollect."
        enabled:
          type: boolean
          description: If true this portal is enabled.
          example: true
        portalCategory:
          type: string
          description: The portal category type
          enum:
          - OTA
          - EXTERNAL_TOOL
        preferred:
          type: boolean
          description: If true this portal is preferred.
          example: true
        xmlType:
          type: boolean
          description: If true this portal is xml type.
          example: true
      description: All the details of the portal of this connection
    ApiLink:
      type: object
      properties:
        href:
          type: string
        rel:
          type: string
        type:
          type: string
    ApiListResponse:
      type: object
      properties:
        page:
          $ref: "#/components/schemas/ApiPage"
        data:
          type: array
          items:
            type: object
        additionalInfo:
          type: object
          additionalProperties:
            type: object
    ApiPage:
      type: object
      properties:
        self:
          $ref: "#/components/schemas/ApiLink"
        previous:
          $ref: "#/components/schemas/ApiLink"
        next:
          $ref: "#/components/schemas/ApiLink"
        page:
          type: integer
          format: int32
        totalPages:
          type: integer
          format: int32
    ApiPortalRequestDTO:
      required:
      - banner
      - contentMetas
      - externalName
      - internalName
      - loginUrl
      - requiresHotelId
      - website
      type: object
      properties:
        internalName:
          type: string
          description: string id for your api
          example: "Your api name with underscore: i.e. my_api_name"
        externalName:
          type: string
          description: public name of your api
          example: Booking.com
        calendarValues:
          type: array
          description: "List of manageable values (only if restricted). If you need\
            \ to have the prices back, please fill at least one of these value and\
            \ subscribe to price webhooks."
          items:
            type: string
            description: "List of manageable values (only if restricted). If you need\
              \ to have the prices back, please fill at least one of these value and\
              \ subscribe to price webhooks."
            enum:
            - PRICE
            - AVAILABILITY
            - MINSTAY
            - MAXSTAY
            - CLOSEARR
            - CLOSEDEP
            - STOPSELL
            - CUTOFF
        colorHex:
          type: string
          description: Color inside the Octorate Calendar
          example: c5c5c5
        logo:
          type: string
          description: 'Logo Inside Octorate (file name). Ignored if you don''t pass
            it when we already have it. '
          example: "To Write: https://www.mywebsite.com/myimage.jpg, In reading: 123432434234.jpg"
        icon:
          type: string
          description: 'Icon Inside Octorate (file name). Ignored if you don''t pass
            it when we already have it. '
          example: "To Write: https://www.mywebsite.com/myimage.jpg, In reading: 123432434234.jpg"
        banner:
          type: string
          description: Banner to show inside octorate (rectangle horizontal format).
            Ignored if you don't pass it when we already have it.
        loginUrl:
          type: string
          description: Login url inside the backoffice of the OTA sites
          example: myapp.com/backoffice/
        requiresHotelId:
          type: boolean
          description: "The connection to this OTA requires the Hotel ID. <br/> In\
            \ detail, what's the hotel id? <br/> It's a param we use to identify the\
            \ accommodation inside the external portal.  For Vacation Rental we normally\
            \ set here the user id of the connection. We use it to group connections\
            \ since, if we discovered that for instance the same connection hotel\
            \ id is repeated in multiple accommodation we may choose to send only\
            \ one discount to that portal instead of repeating it or we may choose\
            \ to copy some data (i.e. access token) if the connection shares this\
            \ id"
        requiresPassword:
          type: boolean
          description: The OTA requires to use a valid username AND password to connect
            to their services
        requiresTokenAuthentication:
          type: boolean
          description: The OTA requires to use a flow to retrieve an access token
            (i.e. OAuth) since this portal supports user based authentication.
        website:
          type: string
          description: Website of the OTA company
          example: www.booking.com
        contentMetas:
          type: array
          description: "List of content meta values manageable from this portal. Setting\
            \ this value for your OTA connection and setting up the content webhooks\
            \ will show your ota connection inside the list. <br/>Otherwise, explicitly\
            \ set it as null will remove the connection from the sites marked as content\
            \ related <br/>Leave empty (without specifing null) if you don't need\
            \ to touch it, otherwise fill always with your expected data (explicitly\
            \ set this field to NULL to clear everything)"
          items:
            type: string
            description: "List of content meta values manageable from this portal.\
              \ Setting this value for your OTA connection and setting up the content\
              \ webhooks will show your ota connection inside the list. <br/>Otherwise,\
              \ explicitly set it as null will remove the connection from the sites\
              \ marked as content related <br/>Leave empty (without specifing null)\
              \ if you don't need to touch it, otherwise fill always with your expected\
              \ data (explicitly set this field to NULL to clear everything)"
    WebhookSubscription:
      type: object
      properties:
        id:
          type: integer
          format: int64
        apiMember:
          type: integer
          format: int64
        type:
          type: string
          enum:
          - RESERVATION_CREATED
          - RESERVATION_CHANGE
          - RESERVATION_CANCELLED
          - RESERVATION_CONFIRMED
          - CONTENT_NOTIFICATION
          - CONTENT_PUSH
          - PORTAL_SUBSCRIPTION_CALENDAR
          - XXX_NOT_USED_PORTAL_PROCESS_FAILED
          - CHAT_MESSAGE_RECEIVED
        createTime:
          type: string
          format: date-time
        processTime:
          type: string
          format: date-time
        endpoint:
          type: string
        priority:
          type: integer
          format: int32
        enabled:
          type: boolean
    ApiAccommodationDTO:
      required:
      - email
      - familyName
      - givenName
      - name
      type: object
      properties:
        id:
          type: string
          description: Reference inside our system
          example: "16997"
        name:
          type: string
          description: Name of the accommodation
          readOnly: true
          example: Manhattan Hotel
        currency:
          type: string
          description: Currency of this property
          example: EUR
        timeZone:
          type: object
          properties:
            displayName:
              type: string
            id:
              type: string
            dstsavings:
              type: integer
              format: int32
            rawOffset:
              type: integer
              format: int32
          description: Time zone of the property
          readOnly: true
        timeZoneOffset:
          type: string
          description: Offset of the time zone of the property
          readOnly: true
        phoneNumber:
          type: string
          description: Phone number of the property
          readOnly: true
        address:
          type: string
          description: Address of the property
          readOnly: true
        latitude:
          type: number
          description: Latitude of the property
          format: double
          readOnly: true
        longitude:
          type: number
          description: Longitude of the property
          format: double
          readOnly: true
        zipCode:
          type: string
          description: ZipCode of the property
          readOnly: true
        city:
          type: string
          description: City of the property
          readOnly: true
        checkinStart:
          type: integer
          description: Checkin time of the property
          format: int32
        checkinEnd:
          type: integer
          description: Checkin time of the property
          format: int32
        checkout:
          type: integer
          description: Checkout time of the property
          format: int32
        networkInfo:
          $ref: "#/components/schemas/ApiNetworkInfo"
        contact:
          $ref: "#/components/schemas/ApiContact"
        propertyCategory:
          type: string
          description: The category of this accommodation
          example: Hotel
          enum:
          - OTHER
          - BEDBREAKFAST
          - APARTMENT
          - HOTEL
          - CAMPGROUND
          - HOSTEL
          - FARMHOUSE
          - CABIN_OR_BUNGALOW
          - CHALET
          - VILLA
          - CASTLE
          - BOUTIQUE
          - GUESTHOUSE
          - CAMPER
          - HOUSE
          - PRIVATE_RESIDENCE
        location:
          $ref: "#/components/schemas/Place"
        networkActive:
          type: boolean
          description: If true this network is active
          deprecated: true
        license:
          $ref: "#/components/schemas/ApiLicenseForm"
        logo:
          type: string
          description: Logo of the property
        icon:
          type: string
          description: Icon of the property
        coverImage:
          type: string
          description: Cover Image
        country:
          type: string
          description: Country of the property
          enum:
          - AF
          - AX
          - AL
          - DZ
          - AS
          - AD
          - AO
          - AI
          - AQ
          - AG
          - AR
          - AM
          - AW
          - AU
          - AT
          - AZ
          - BS
          - BH
          - BD
          - BB
          - BY
          - BE
          - BZ
          - BJ
          - BM
          - BT
          - BO
          - BQ
          - BA
          - BW
          - BV
          - BR
          - IO
          - BN
          - BG
          - BF
          - BI
          - KH
          - CM
          - CA
          - CV
          - KY
          - CF
          - TD
          - CL
          - CN
          - CX
          - CC
          - CO
          - KM
          - CG
          - CD
          - CK
          - CR
          - CI
          - HR
          - CU
          - CW
          - CY
          - CZ
          - DK
          - DJ
          - DM
          - DO
          - EC
          - EG
          - SV
          - GQ
          - ER
          - EE
          - ET
          - FK
          - FO
          - FJ
          - FI
          - FR
          - GF
          - PF
          - TF
          - GA
          - GM
          - GE
          - DE
          - GH
          - GI
          - GR
          - GL
          - GD
          - GP
          - GU
          - GT
          - GG
          - GN
          - GW
          - GY
          - HT
          - HM
          - VA
          - HN
          - HK
          - HU
          - IS
          - IN
          - ID
          - IR
          - IQ
          - IE
          - IM
          - IL
          - IT
          - JM
          - JP
          - JE
          - JO
          - KZ
          - KE
          - KI
          - KP
          - KR
          - KW
          - KG
          - LA
          - LV
          - LB
          - LS
          - LR
          - LY
          - LI
          - LT
          - LU
          - MO
          - MK
          - MG
          - MW
          - MY
          - MV
          - ML
          - MT
          - MH
          - MQ
          - MR
          - MU
          - YT
          - MX
          - FM
          - MD
          - MC
          - MN
          - ME
          - MS
          - MA
          - MZ
          - MM
          - NA
          - NR
          - NP
          - NL
          - NC
          - NZ
          - NI
          - NE
          - NG
          - NU
          - NF
          - MP
          - "NO"
          - OM
          - PK
          - PW
          - PS
          - PA
          - PG
          - PY
          - PE
          - PH
          - PN
          - PL
          - PT
          - PR
          - QA
          - RE
          - RO
          - RU
          - RW
          - BL
          - SH
          - KN
          - LC
          - MF
          - PM
          - VC
          - WS
          - SM
          - ST
          - SA
          - SN
          - RS
          - SC
          - SL
          - SG
          - SX
          - SK
          - SI
          - SB
          - SO
          - ZA
          - GS
          - SS
          - ES
          - LK
          - SD
          - SR
          - SJ
          - SZ
          - SE
          - CH
          - SY
          - TW
          - TJ
          - TZ
          - TH
          - TL
          - TG
          - TK
          - TO
          - TT
          - TN
          - TR
          - TM
          - TC
          - TV
          - UG
          - UA
          - AE
          - GB
          - US
          - UM
          - UY
          - UZ
          - VU
          - VE
          - VN
          - VG
          - VI
          - WF
          - EH
          - YE
          - ZM
          - ZW
          - XJ
        masterCalendar:
          type: boolean
          description: Indicates if this property is Master Calendar
        clpms:
          $ref: "#/components/schemas/ApiClpmsDTO"
        insertTime:
          type: string
          description: The creation date of this property inside Octorate
          format: date
        policeAccount:
          $ref: "#/components/schemas/PoliceAccountDTO"
        cleaningCost:
          type: integer
          description: Final cleaning cost
          format: int32
          example: 25
        breakfastIncluded:
          type: boolean
          description: Breakfast included
          example: true
        breakfastPrice:
          type: number
          description: Breakfast extra price
          example: 15
        autoClose:
          type: boolean
          description: Auto close
          example: true
        zip:
          type: string
          description: The postal zip code of the accommodation
        district:
          type: string
          description: Free tax to represent the district or the nearest upper region
            level after the city
          example: Roma
        website:
          type: string
          description: The website of the accommodation
          example: www.google.it
        givenName:
          type: string
          description: The given name for the person or the company
          example: Oscar
        familyName:
          type: string
          description: The family name for this person
          example: Slim Dogg T
        companyType:
          type: string
          enum:
          - PRIVATE_PERSON
          - INDIVIDUAL_COMPANY
          - COMPANY
          - INSTITUTION
          - ENTITY
          default: Derived from VAT/Fiscal
        email:
          type: string
          description: This email is the email where the customer will receive new
            communications from Octorate. To this mail we will also send the credentials
            to log in
          example: myname@mycompany.com
        welcome_user:
          type: boolean
          description: "Welcome mail: send a mail with username and generated password\
            \ to the customer. If you're an Octorate reseller this mail can be customized.\
            \ Please set as false only if you need to create a network, otherwise\
            \ we suggest tp set it true"
          example: true
          default: true
        welcome_alternative_email:
          type: string
          description: "Welcome mail (Copy) or Alternative Mail: add to CC a mail\
            \ with username and generated password to the customer. Set welcome_user\
            \ false and fill only this email to send the credentials only to this\
            \ address."
          example: test@mail.com
          default: "null"
        network_name:
          type: string
          description: "Optional field to add an accommodation when you're creating\
            \ a new property. Please note if you do in this step, you may have the\
            \ same refresh_token for all the group of properties instead one per property."
          example: "123445"
        phone:
          type: string
          description: Phone Address including prefix
        accept_duplicates:
          type: boolean
        cod_promo:
          type: string
          description: Promotion code
          nullable: true
        vatCode:
          type: string
          description: Identity a tax code for a company
        fiscalCode:
          type: string
          description: Identify a tax person as normal person
        taxIncluded:
          type: boolean
          writeOnly: true
        taxes:
          type: number
          description: Tax percentage for this accommodation
        layout:
          $ref: "#/components/schemas/ApiLayoutDTO"
        lastCashClosingDay:
          type: string
          description: The last cash closing day of this accommodation
          format: date
        customerHead:
          $ref: "#/components/schemas/ApiAccommodationHeadDTO"
        invoiceOptions:
          $ref: "#/components/schemas/ApiInvoiceOptionsDTO"
        sandboxProperty:
          type: boolean
          description: True if the accommodation is fake
        datePattern:
          type: string
          description: Preferred date pattern of this accommodation
        language:
          type: string
          description: "Language normally spoken inside the accommodation. NOTE: Every\
            \ user may have another setting. This may be a template for users or some\
            \ specific settings"
          enum:
          - IT
          - EN
          - FR
          - ES
          - DE
          - RU
          - PT
          - NL
          - JA
          - EL
          - TR
          - ZH
          - CA
          - RO
        licenseCode:
          type: string
          description: License code inside octorate
        credit:
          type: number
          description: Actual balance
        billingNetworkMasterAccount:
          type: boolean
          description: true if this accommodation is a billing network master account
        billingNetworkName:
          type: string
          description: The billing network name
        additionalInformation:
          type: string
          description: "The additional information on the address, floor..."
        rating:
          type: string
          description: The rating of the accommodation
          enum:
          - NONE
          - STAR1
          - STAR1S
          - STAR2
          - STAR2S
          - STAR3
          - STAR3S
          - STAR4
          - STAR4S
          - STAR5
          - STAR5L
        preferThisLanguage:
          type: boolean
          description: Whether or not the accommodation prefer the accommodation language
            instead of EN
        totalBeds:
          type: integer
          description: Total number of beds of this accommodation
          format: int32
        adminUserAccessGranted:
          type: boolean
          description: Whether administrators are authorized to access the accommodation
            users
        mailTemplate:
          type: string
    ApiAccommodationHeadDTO:
      type: object
      properties:
        id:
          type: integer
          description: Reference inside our system
          format: int64
        givenName:
          type: string
          description: The given name
        familyName:
          type: string
          description: The family name
        country:
          type: string
          description: The country
          enum:
          - AF
          - AX
          - AL
          - DZ
          - AS
          - AD
          - AO
          - AI
          - AQ
          - AG
          - AR
          - AM
          - AW
          - AU
          - AT
          - AZ
          - BS
          - BH
          - BD
          - BB
          - BY
          - BE
          - BZ
          - BJ
          - BM
          - BT
          - BO
          - BQ
          - BA
          - BW
          - BV
          - BR
          - IO
          - BN
          - BG
          - BF
          - BI
          - KH
          - CM
          - CA
          - CV
          - KY
          - CF
          - TD
          - CL
          - CN
          - CX
          - CC
          - CO
          - KM
          - CG
          - CD
          - CK
          - CR
          - CI
          - HR
          - CU
          - CW
          - CY
          - CZ
          - DK
          - DJ
          - DM
          - DO
          - EC
          - EG
          - SV
          - GQ
          - ER
          - EE
          - ET
          - FK
          - FO
          - FJ
          - FI
          - FR
          - GF
          - PF
          - TF
          - GA
          - GM
          - GE
          - DE
          - GH
          - GI
          - GR
          - GL
          - GD
          - GP
          - GU
          - GT
          - GG
          - GN
          - GW
          - GY
          - HT
          - HM
          - VA
          - HN
          - HK
          - HU
          - IS
          - IN
          - ID
          - IR
          - IQ
          - IE
          - IM
          - IL
          - IT
          - JM
          - JP
          - JE
          - JO
          - KZ
          - KE
          - KI
          - KP
          - KR
          - KW
          - KG
          - LA
          - LV
          - LB
          - LS
          - LR
          - LY
          - LI
          - LT
          - LU
          - MO
          - MK
          - MG
          - MW
          - MY
          - MV
          - ML
          - MT
          - MH
          - MQ
          - MR
          - MU
          - YT
          - MX
          - FM
          - MD
          - MC
          - MN
          - ME
          - MS
          - MA
          - MZ
          - MM
          - NA
          - NR
          - NP
          - NL
          - NC
          - NZ
          - NI
          - NE
          - NG
          - NU
          - NF
          - MP
          - "NO"
          - OM
          - PK
          - PW
          - PS
          - PA
          - PG
          - PY
          - PE
          - PH
          - PN
          - PL
          - PT
          - PR
          - QA
          - RE
          - RO
          - RU
          - RW
          - BL
          - SH
          - KN
          - LC
          - MF
          - PM
          - VC
          - WS
          - SM
          - ST
          - SA
          - SN
          - RS
          - SC
          - SL
          - SG
          - SX
          - SK
          - SI
          - SB
          - SO
          - ZA
          - GS
          - SS
          - ES
          - LK
          - SD
          - SR
          - SJ
          - SZ
          - SE
          - CH
          - SY
          - TW
          - TJ
          - TZ
          - TH
          - TL
          - TG
          - TK
          - TO
          - TT
          - TN
          - TR
          - TM
          - TC
          - TV
          - UG
          - UA
          - AE
          - GB
          - US
          - UM
          - UY
          - UZ
          - VU
          - VE
          - VN
          - VG
          - VI
          - WF
          - EH
          - YE
          - ZM
          - ZW
          - XJ
      description: The customer head of this accommodation
    ApiClpmsDTO:
      type: object
      properties:
        codice:
          type: string
          description: The codice of the accommodation
          example: "999999"
        userAllowed:
          type: integer
          description: Number of available users for the accommodation
          format: int32
          example: 2
        cleaningDays:
          type: integer
          description: Cleaning or change linen every
          format: int32
          example: 1
        cleaningMail:
          type: boolean
          description: Do you want cleaning/changing linen reminder by mail?
          example: true
        closeoutTime:
          type: integer
          description: Closeout actived starting from (hour)
          format: int32
          example: 10
        arrivalTime:
          type: string
          description: Indicates if the arrival time is requested to the guest
          example: REQUIRED
          enum:
          - "NO"
          - REQUIRED
          - OPTIONAL
        paymentProcessor:
          type: string
          description: The payment processor
          example: STRIPE
          enum:
          - SYSPAY
          - STRIPE
          - NONE
          - PAYULATAM
          - PAYBYPAGO
          - ADDONPAYMENTS
          - NOT_USED_ASIAPAY_PESOPAY
          - NOT_USED_ASIAPAY_PAYDOLLAR
          - NOT_USED_ASIAPAY_SIAMPAY
          - DUMMY_PROCESSOR
          - NEXI
          - NOT_USED_PAYWAY
          - NOT_USED_OPAYO
          - CMI
          - MERCADOPAGO
          - STRIPE_CARD_PRESENTED
          - AZUL
          - REDSYS
        chatAiEnabled:
          type: boolean
          description: Indicates if new chat threads will be ai driven.
        features:
          type: array
          description: Enabled experimental features
          readOnly: true
          items:
            type: string
            description: Enabled experimental features
            readOnly: true
            enum:
            - XXX_NOT_USED_NEW_MATCHED_ROOMS
            - XXX_NOT_USED_NEW_PAGE_RESERVATION
            - PAYMENT_PREVIEW
            - XXX_NOT_USED_CALENDAR
            - PLANNING
            - XXX_NOT_USED_PMS_ADVANCED
            - XXX_NOT_USED_CONTENT_PREVIEW
            - BE_PREVIEW
            - XXX_NOT_USED_OCTODAY
            - XXX_FISCAL_PRINTER_IMPORT
            - XXX_NOT_USED_RMS_PREVIEW
            - XXX_NOT_USED_PREMIER
            - IMPORTANT_CUSTOMER
            - NEW_PAGE_RESERVATION_ADD
            - WEBSITE_PREVIEWS
            - XXX_NOT_USED_COPY_ROOMS
            - VACATION_RENTAL_CREATION_WIZARD
            - CHANNEL_MAMAGER_BETA_FUNCTIONS
            - SPECIAL_AGREEMENT_API
            - E_INVOICE
        activeRatePlanCross:
          type: boolean
          description: Active Rate Plan Cross
        goodMorningEmail:
          type: boolean
          description: Good Morning Email
      description: Configurations of the accommodation
    ApiContact:
      type: object
      properties:
        contactName:
          type: string
          description: Name of this contact type
        phoneNumber:
          type: string
          description: Phone number of the accommodation
        phoneNumber2:
          type: string
          description: Secondary phone number of the accommodation
        mobileNumberFull:
          type: string
          description: Mobile phone number of the accommodation
        mobilePrefix:
          type: string
          description: Mobile prefix number
        mobileNumber:
          type: string
          description: Mobile national number
        email:
          type: string
          description: Email address of the property
          readOnly: true
        secondaryEmail:
          type: string
          description: Secondary email address of the property
        givenName:
          type: string
          description: First name of the property owner
        familyName:
          type: string
          description: Last name of the property owner
      description: Contact information of this property
    ApiInvoiceOptionsDTO:
      type: object
      properties:
        id:
          type: integer
          description: Reference inside our system
          format: int64
        accommodationId:
          type: string
          description: The id of the accommodation
          example: "999999"
        treasuryActive:
          type: boolean
          description: true if the integration with the treasury is active
        splitCommissionPropertyManager:
          type: boolean
          description: True if I have to break Property Manager Commission
      description: The invoice options of this accommodation
    ApiLayoutDTO:
      type: object
      properties:
        accommodationId:
          type: string
          description: The id of the accommodation
          example: "999999"
        vatLabel:
          type: object
          additionalProperties:
            type: string
            description: The VAT label for this accommodation
            example: "{\"FR\":\"TVA\",\"RU\":\"\",\"PT\":\"\",\"NL\":\"\",\"EN\":\"\
              VAT\",\"ES\":\"IVA/VAT\",\"IT\":\"IVA\",\"JA\":\"\",\"DE\":\"VAT\",\"\
              TR\":\"\",\"EL\":\"\"}"
          description: The VAT label for this accommodation
          example:
            FR: TVA
            RU: ""
            PT: ""
            NL: ""
            EN: VAT
            ES: IVA/VAT
            IT: IVA
            JA: ""
            DE: VAT
            TR: ""
            EL: ""
      description: Layout information of this accommodation
    ApiLicenseForm:
      type: object
      properties:
        channelManager:
          type: string
          description: The channel manager version
          enum:
          - FREE
          - BASIC
          - PRO
          - ENTERPRISE
          - PREMIUM
        bookingEngine:
          type: boolean
          description: Is active the booking engine? (Book reservation engine)
        octoSite:
          type: boolean
          description: Is active the octosite? (Generated website)
        realPlanning:
          type: boolean
          description: Is active the real planning? (Generated pms)
        versionPmsStats:
          type: boolean
          description: Is active the pms?
        webConcierge:
          type: boolean
          description: Is active the webconcierge? (Mails to customer & booking engine
            assist)
        chat:
          type: boolean
          description: Is the messenger chat active?
        smartOffer:
          type: boolean
          description: Are the proposals enabled?
        octoDaily:
          type: boolean
          description: Is the house keeping enabled?
        rms:
          type: boolean
          description: Are the Revenue services enabled?
        businessIntelligence:
          type: boolean
          description: Is active the business intelligence?
        metaSearch:
          type: boolean
          description: Is active the meta search?
        octoSiteAdvanced:
          type: boolean
          description: Is active the OctoSite Advanced?
        rateChecker:
          type: boolean
          description: Is active the rate checker?
        fiscalPrinter:
          type: boolean
          description: Fiscal Printer (Italian Customer) Enabled
        invoice:
          type: boolean
          description: Is Invoices active?
        roomsLimit:
          type: integer
          description: The max number of the rooms
          format: int32
        roomsCount:
          type: integer
          description: The actual rooms count
          format: int32
        billingNetworkMode:
          type: string
          description: The billing network mode
          enum:
          - SYNCH_ALL
          - SYNCH_PRICE
          - SYNCH_FREE
        billingNetworkMaxChildren:
          type: integer
          description: The max number of the children for the network
          format: int32
        childrenCount:
          type: integer
          description: The actual children count
          format: int32
        expireDay:
          type: string
          description: Day of expiration of the license
          format: date-time
      description: Current active license of this property
    ApiNetworkInfo:
      type: object
      properties:
        accessNetwork:
          type: string
          description: Access network name
        accessRoot:
          type: boolean
          description: Is this the access network root?
        accessEnabled:
          type: boolean
          description: is this enabled?
      description: Network details
    Place:
      type: object
      properties:
        id:
          type: integer
          format: int64
        placeType:
          type: string
          enum:
          - ROOM
          - ACCOMODATION
        address:
          type: string
        city:
          type: string
        locality:
          type: string
        zipCode:
          type: string
        country:
          type: string
          enum:
          - AF
          - AX
          - AL
          - DZ
          - AS
          - AD
          - AO
          - AI
          - AQ
          - AG
          - AR
          - AM
          - AW
          - AU
          - AT
          - AZ
          - BS
          - BH
          - BD
          - BB
          - BY
          - BE
          - BZ
          - BJ
          - BM
          - BT
          - BO
          - BQ
          - BA
          - BW
          - BV
          - BR
          - IO
          - BN
          - BG
          - BF
          - BI
          - KH
          - CM
          - CA
          - CV
          - KY
          - CF
          - TD
          - CL
          - CN
          - CX
          - CC
          - CO
          - KM
          - CG
          - CD
          - CK
          - CR
          - CI
          - HR
          - CU
          - CW
          - CY
          - CZ
          - DK
          - DJ
          - DM
          - DO
          - EC
          - EG
          - SV
          - GQ
          - ER
          - EE
          - ET
          - FK
          - FO
          - FJ
          - FI
          - FR
          - GF
          - PF
          - TF
          - GA
          - GM
          - GE
          - DE
          - GH
          - GI
          - GR
          - GL
          - GD
          - GP
          - GU
          - GT
          - GG
          - GN
          - GW
          - GY
          - HT
          - HM
          - VA
          - HN
          - HK
          - HU
          - IS
          - IN
          - ID
          - IR
          - IQ
          - IE
          - IM
          - IL
          - IT
          - JM
          - JP
          - JE
          - JO
          - KZ
          - KE
          - KI
          - KP
          - KR
          - KW
          - KG
          - LA
          - LV
          - LB
          - LS
          - LR
          - LY
          - LI
          - LT
          - LU
          - MO
          - MK
          - MG
          - MW
          - MY
          - MV
          - ML
          - MT
          - MH
          - MQ
          - MR
          - MU
          - YT
          - MX
          - FM
          - MD
          - MC
          - MN
          - ME
          - MS
          - MA
          - MZ
          - MM
          - NA
          - NR
          - NP
          - NL
          - NC
          - NZ
          - NI
          - NE
          - NG
          - NU
          - NF
          - MP
          - "NO"
          - OM
          - PK
          - PW
          - PS
          - PA
          - PG
          - PY
          - PE
          - PH
          - PN
          - PL
          - PT
          - PR
          - QA
          - RE
          - RO
          - RU
          - RW
          - BL
          - SH
          - KN
          - LC
          - MF
          - PM
          - VC
          - WS
          - SM
          - ST
          - SA
          - SN
          - RS
          - SC
          - SL
          - SG
          - SX
          - SK
          - SI
          - SB
          - SO
          - ZA
          - GS
          - SS
          - ES
          - LK
          - SD
          - SR
          - SJ
          - SZ
          - SE
          - CH
          - SY
          - TW
          - TJ
          - TZ
          - TH
          - TL
          - TG
          - TK
          - TO
          - TT
          - TN
          - TR
          - TM
          - TC
          - TV
          - UG
          - UA
          - AE
          - GB
          - US
          - UM
          - UY
          - UZ
          - VU
          - VE
          - VN
          - VG
          - VI
          - WF
          - EH
          - YE
          - ZM
          - ZW
          - XJ
        phone:
          type: string
        latitude:
          type: number
          format: double
        longitude:
          type: number
          format: double
        zoom:
          type: integer
          description: Default zoom for this property on the map
          format: int32
        civicNumber:
          type: string
        additionalInformation:
          type: string
        codice:
          type: string
        districtName:
          type: string
        fullAddress:
          type: string
        countryAlpha2:
          type: string
        placeName:
          type: object
          properties:
            emptyValues:
              type: boolean
            empty:
              type: boolean
          additionalProperties:
            type: string
            example: "{\"EN\":\"These are the LanguageMap value in English!\"}"
            default: "{\"EN\":\"These are the access rule in English!\"}"
          writeOnly: true
          example:
            EN: These are the LanguageMap value in English!
          default:
            EN: These are the access rule in English!
        phone2:
          type: string
        phonePrefix:
          type: string
        firstLocality:
          type: string
      description: Information related to the place
    PoliceAccountDTO:
      type: object
      properties:
        codice:
          type: string
          description: The codice
          example: "999999"
        wsCode:
          type: string
          description: The ws code
        sendId:
          type: integer
          description: The send id
          format: int32
        autorun:
          type: boolean
          description: The autorun flag
        valid:
          type: boolean
          description: The valid flag
        groupGuest:
          type: boolean
          description: The groupGuest flag
        groupGuestByRoom:
          type: boolean
          description: The groupGuestByRoom flag
        lastCron:
          type: string
          description: The last cron run timestamp
          format: date-time
      description: The police account of the accommodation
    ApiJsonPatchDTO:
      type: object
      properties:
        op:
          type: string
          description: "RFC6902 operation: add, remove, replace, move, copy, test"
          example: replace
          enum:
          - add
          - remove
          - replace
          - move
          - copy
          - test
        path:
          type: string
          description: JSON Pointer path (RFC6901)
          example: /path/to/field
        value:
          type: string
          description: New value as JSON string (object/array/scalar)
        oldValue:
          type: string
          description: Previous value as JSON string (non-standard enrichment)
        from:
          type: string
          description: '''from'' field for move/copy operations'
        viewValue:
          type: string
          description: Textual representation of the new value for the UI
        viewOldValue:
          type: string
          description: Textual representation of the previous value for the UI
        type:
          type: string
          description: Type indication
          enum:
          - BOOLEAN
          - NUMBER
          - DATE
          - DATETIME
          - COLOR
          - STRING
      description: The json patch (enriched RFC 6902) tracking the changes of this
        log
    ApiLogDTO:
      type: object
      properties:
        id:
          type: integer
          description: Reference inside our system
          format: int64
          example: 17
        accommodationId:
          type: string
          description: The accommodation id
          example: "999999"
        userId:
          type: integer
          description: The user id
          format: int64
          example: 999999
        remoteAddress:
          type: string
          description: The remote address
          example: 127.0.0.1
        type:
          type: string
          description: The log type
          example: USER_LOGIN
          enum:
          - PORTAL_NOTIFY
          - PORTAL_CONNECT
          - PORTAL_ROOM
          - PORTAL_RESA
          - PORTAL_CALENDAR
          - PORTAL_ONLINE
          - PORTAL_EXPIRED
          - PORTAL_COMMENT
          - PORTAL_ACCEPT
          - USER_LOGIN
          - CALENDAR_IMPORT
          - CALENDAR_EXPORT
          - GOOGLE_EXPORT
          - GOOGLE_IMPORT
          - PORTAL_OCTORATE
          - ROOM_ASSIGNED
          - RESERVATION_CHANGE
          - DELETE_RESA
          - INVOICE_EDIT
          - PORTAL_MOTHER
          - PAYMENT_RESA
          - PAYMENT_RESA_DELETED
          - EXTRA_CHANGE
          - EXTRA_DELETE
          - INVOICE_DELETE
          - EXTERNAL_CHANNEL
          - SECURITY
          - TERMINATION
          - INVOICE_ITEM_EDIT
          - INVOICE_ITEM_DELETE
          - AIRBNB_SYNCH
          - PAYMENT_PROFILE
          - PAYOFF_MODIFIED
          - PAYOFF_DELETED
          - PHP_CONFIGURATION_EDITED
          - FIX_ROOM_MOTHER
          - ELETTRONIC_FISCAL_EXPORT
          - RESERVATION_PAYMENT_PROFILE
          - ROOM_CANCELLATION
          - CALENDAR_SETTINGS
          - ROOM_EDIT
          - PORTAL_PMS_ROOM
          - FISCAL_PRINTER_DISABLED
          - PORTAL_CONFIGURATION_ALTER
          - PAYSTEP_DELETE
          - PAYSTEP_EDIT
          - RESA_IMPORT_DECREMENT_AVAIL
          - PORTAL_MAPPING_ALTERED
          - PORTAL_RATES
          - PORTAL_CONTENT
          - PORTAL_OFFLINE
          - EXTRA_CREATED
          - PORTAL_INSIGHT
          - PORTAL_INSIGHT_PRICES
          - MOVE_ROOMS_TO_EXISTING_STRUCTURE
          - MOVE_ROOMS_TO_NEW_STRUCTURE
          - PORTAL_ROOM_FORCE_INITIAL_MAPPING
          - DERIVED_RATES_EDIT
          - SUITE_CHANGED
          - TEMPLATE_CHANGE
          - USER_MODIFIED
          - USER_CREATED
          - FACILITY_EDIT
          - POLICE_SETTINGS_EDIT
          - PORTAL_CORRECTION_PRICE
          - PORTAL_AVAILABILITY_SETTINGS
          - PORTAL_OCTORATE_ALIGN_CALENDAR_NETWORK
          - RESERVATION_CREATE
          - PASSWORD_CHANGED
          - USER_SWITCH
          - RESERVATION_EXPORT
          - CONTACT_INFO_SHOWN
          - TAX_SETTINGS_EDIT
          - ADMIN_USER_ACCESS_CHANGED
          - POLICE_DISCONNECT
        insertTime:
          type: string
          description: The insert time in UTC (ISO8601)
          format: date-time
          example: 2023-03-08T13:04:14.85Z
        referenceType:
          type: string
          description: The reference type
          example: GENERIC
          enum:
          - GENERIC
          - RESERVATION
          - PORTALCONNECTION
          - INVOICE
          - PAYMENT
          - ACCOMMODATION
          - VERSION
          - INVOICE_ITEM
          - PAYOFF
          - ROOM
          - ROOMPORTAL
          - CONTENT_PROCESS
          - PAY_STEP
          - ANNUAL_REPORT
          - PERSON
          - USER
        reference:
          type: integer
          description: "Reference (id of invoice, id of reservation, etc..)"
          format: int64
          example: 999999
        content:
          type: string
          description: The content
        snapshot:
          type: string
          description: A snapshot of the content
        patches:
          type: array
          description: The json patch (enriched RFC 6902) tracking the changes of
            this log
          items:
            $ref: "#/components/schemas/ApiJsonPatchDTO"
        label:
          type: string
          description: The label
        result:
          type: string
          description: The result
          example: EXECUTED
          enum:
          - NOT_EXECUTED
          - EXECUTED
        reservationId:
          type: integer
          description: The reservation id
          format: int64
          nullable: true
          example: 999999
        invoiceId:
          type: integer
          description: The invoice id
          format: int64
          nullable: true
          example: 999999
        userUsername:
          type: string
          description: Username of the user who performed the action
          example: octo_user
        userFirstname:
          type: string
          description: First name of the user who performed the action
          example: Mario
        userLastname:
          type: string
          description: Last name of the user who performed the action
          example: Rossi
        sentToProd:
          type: boolean
          description: "Indicates whether the record was originated in a sandbox environment\
            \ and later synchronized to production. NULL = record originally created\
            \ in production; false = created in sandbox, not yet sent to production;\
            \ true = created in sandbox and already sent to production"
        sandboxId:
          type: integer
          description: Original ID of the record initially created in the sandbox
            environment
          format: int64
          example: 12345
      description: Get the last log of type PORTAL_ACCEPT
      readOnly: true
    ApiReviewCategoryDTO:
      type: object
      properties:
        id:
          type: integer
          description: Reference inside our system
          format: int64
          example: 17
        category:
          type: string
          description: The category
          example: respect_house_rules
          enum:
          - cleanliness
          - communication
          - respect_house_rules
          - accuracy
          - checkin
          - location
          - value
        rating:
          type: number
          description: "A rating from scale of 1.0 to 5.0, 5.0 being highest"
          format: double
          example: 5.0
        comment:
          type: string
          description: Explanation for the rating
          example: Test
        count:
          type: integer
          description: Count of this specific category rating for the entity (used
            for Statistics)
          format: int64
          example: 2
        reviewCategoryTags:
          type: array
          description: List of all category tags for the reservation associated with
            this review
          items:
            $ref: "#/components/schemas/ApiReviewCategoryTagDTO"
      description: List of all category ratings for the reservation associated with
        this review
    ApiReviewCategoryTagDTO:
      type: object
      properties:
        id:
          type: integer
          description: Reference inside our system
          format: int64
          example: 2
        reviewCategoryTagType:
          type: string
          description: The tag
          example: GUEST_REVIEW_HOST_POSITIVE_LOOKED_LIKE_PHOTOS
          enum:
          - GUEST_REVIEW_HOST_POSITIVE_LOOKED_LIKE_PHOTOS
          - GUEST_REVIEW_HOST_POSITIVE_MATCHED_DESCRIPTION
          - GUEST_REVIEW_HOST_POSITIVE_HAD_LISTED_AMENITIES_AND_SERVICES
          - GUEST_REVIEW_HOST_NEGATIVE_SMALLER_THAN_EXPECTED
          - GUEST_REVIEW_HOST_NEGATIVE_DID_NOT_MATCH_PHOTOS
          - GUEST_REVIEW_HOST_NEGATIVE_NEEDS_MAINTENANCE
          - GUEST_REVIEW_HOST_NEGATIVE_UNEXPECTED_FEES
          - GUEST_REVIEW_HOST_NEGATIVE_EXCESSIVE_RULES
          - GUEST_REVIEW_HOST_NEGATIVE_UNEXPECTED_NOISE
          - GUEST_REVIEW_HOST_NEGATIVE_INACCURATE_LOCATION
          - GUEST_REVIEW_HOST_NEGATIVE_MISSING_AMENITY
          - GUEST_REVIEW_HOST_NEGATIVE_BROKEN_OR_MISSING_LOCK
          - GUEST_REVIEW_HOST_NEGATIVE_UNEXPECTED_GUESTS
          - GUEST_REVIEW_HOST_NEGATIVE_INCORRECT_BATHROOM
          - GUEST_REVIEW_HOST_POSITIVE_RESPONSIVE_HOST
          - GUEST_REVIEW_HOST_POSITIVE_CLEAR_INSTRUCTIONS
          - GUEST_REVIEW_HOST_POSITIVE_EASY_TO_FIND
          - GUEST_REVIEW_HOST_POSITIVE_EASY_TO_GET_INSIDE
          - GUEST_REVIEW_HOST_POSITIVE_FLEXIBLE_CHECK_IN
          - GUEST_REVIEW_HOST_NEGATIVE_HARD_TO_LOCATE
          - GUEST_REVIEW_HOST_NEGATIVE_UNCLEAR_INSTRUCTIONS
          - GUEST_REVIEW_HOST_NEGATIVE_TROUBLE_WITH_LOCK
          - GUEST_REVIEW_HOST_NEGATIVE_UNRESPONSIVE_HOST
          - GUEST_REVIEW_HOST_NEGATIVE_HAD_TO_WAIT
          - GUEST_REVIEW_HOST_NEGATIVE_HARD_TO_GET_INSIDE
          - GUEST_REVIEW_HOST_POSITIVE_FELT_AT_HOME
          - GUEST_REVIEW_HOST_POSITIVE_SPOTLESS_FURNITURE_AND_LINENS
          - GUEST_REVIEW_HOST_POSITIVE_FREE_OF_CLUTTER
          - GUEST_REVIEW_HOST_POSITIVE_SQUEAKY_CLEAN_BATHROOM
          - GUEST_REVIEW_HOST_POSITIVE_PRISTINE_KITCHEN
          - GUEST_REVIEW_HOST_NEGATIVE_DIRTY_OR_DUSTY
          - GUEST_REVIEW_HOST_NEGATIVE_NOTICEABLE_SMELL
          - GUEST_REVIEW_HOST_NEGATIVE_STAINS
          - GUEST_REVIEW_HOST_NEGATIVE_EXCESSIVE_CLUTTER
          - GUEST_REVIEW_HOST_NEGATIVE_MESSY_KITCHEN
          - GUEST_REVIEW_HOST_NEGATIVE_HAIR_OR_PET_HAIR
          - GUEST_REVIEW_HOST_NEGATIVE_DIRTY_BATHROOM
          - GUEST_REVIEW_HOST_NEGATIVE_TRASH_LEFT_BEHIND
          - GUEST_REVIEW_HOST_POSITIVE_ALWAYS_RESPONSIVE
          - GUEST_REVIEW_HOST_POSITIVE_LOCAL_RECOMMENDATIONS
          - GUEST_REVIEW_HOST_POSITIVE_PROACTIVE
          - GUEST_REVIEW_HOST_POSITIVE_HELPFUL_INSTRUCTIONS
          - GUEST_REVIEW_HOST_POSITIVE_CONSIDERATE
          - GUEST_REVIEW_HOST_NEGATIVE_SLOW_TO_RESPOND
          - GUEST_REVIEW_HOST_NEGATIVE_NOT_HELPFUL
          - GUEST_REVIEW_HOST_NEGATIVE_MISSING_HOUSE_INSTRUCTIONS
          - GUEST_REVIEW_HOST_NEGATIVE_UNCLEAR_CHECKOUT_TASKS
          - GUEST_REVIEW_HOST_NEGATIVE_INCONSIDERATE
          - GUEST_REVIEW_HOST_NEGATIVE_EXCESSIVE_CHECKOUT_TASKS
          - GUEST_REVIEW_HOST_POSITIVE_PEACEFUL
          - GUEST_REVIEW_HOST_POSITIVE_BEAUTIFUL_SURROUNDINGS
          - GUEST_REVIEW_HOST_POSITIVE_PRIVATE
          - GUEST_REVIEW_HOST_POSITIVE_GREAT_RESTAURANTS
          - GUEST_REVIEW_HOST_POSITIVE_LOTS_TO_DO
          - GUEST_REVIEW_HOST_POSITIVE_WALKABLE
          - GUEST_REVIEW_HOST_NEGATIVE_NOISY
          - GUEST_REVIEW_HOST_NEGATIVE_NOT_MUCH_TO_DO
          - GUEST_REVIEW_HOST_NEGATIVE_BLAND_SURROUNDINGS
          - GUEST_REVIEW_HOST_NEGATIVE_NOT_PRIVATE
          - GUEST_REVIEW_HOST_NEGATIVE_INCONVENIENT_LOCATION
          - HOST_REVIEW_GUEST_POSITIVE_NEAT_AND_TIDY
          - HOST_REVIEW_GUEST_POSITIVE_KEPT_IN_GOOD_CONDITION
          - HOST_REVIEW_GUEST_POSITIVE_TOOK_CARE_OF_GARBAGE
          - HOST_REVIEW_GUEST_NEGATIVE_IGNORED_CHECKOUT_DIRECTIONS
          - HOST_REVIEW_GUEST_NEGATIVE_GARBAGE
          - HOST_REVIEW_GUEST_NEGATIVE_MESSY_KITCHEN
          - HOST_REVIEW_GUEST_NEGATIVE_DAMAGE
          - HOST_REVIEW_GUEST_NEGATIVE_RUINED_BED_LINENS
          - HOST_REVIEW_GUEST_NEGATIVE_ARRIVED_EARLY
          - HOST_REVIEW_GUEST_NEGATIVE_STAYED_PAST_CHECKOUT
          - HOST_REVIEW_GUEST_NEGATIVE_UNAPPROVED_GUESTS
          - HOST_REVIEW_GUEST_NEGATIVE_UNAPPROVED_PET
          - HOST_REVIEW_GUEST_NEGATIVE_DID_NOT_RESPECT_QUIET_HOURS
          - HOST_REVIEW_GUEST_NEGATIVE_UNAPPROVED_FILMING
          - HOST_REVIEW_GUEST_NEGATIVE_UNAPPROVED_EVENT
          - HOST_REVIEW_GUEST_NEGATIVE_SMOKING
          - HOST_REVIEW_GUEST_POSITIVE_HELPFUL_MESSAGES
          - HOST_REVIEW_GUEST_POSITIVE_RESPECTFUL
          - HOST_REVIEW_GUEST_POSITIVE_ALWAYS_RESPONDED
          - HOST_REVIEW_GUEST_NEGATIVE_UNHELPFUL_MESSAGES
          - HOST_REVIEW_GUEST_NEGATIVE_DISRESPECTFUL
          - HOST_REVIEW_GUEST_NEGATIVE_UNREACHABLE
          - HOST_REVIEW_GUEST_NEGATIVE_SLOW_RESPONSES
          - ACCURACY_OTHER
          - CHECK_IN_OTHER
          - CLEANLINESS_OTHER
          - COMMUNICATION_OTHER
          - LOCATION_OTHER
          - RESPECT_HOUSE_RULES_OTHER
          - UNDEFINED
        count:
          type: integer
          description: The count of reviews with this tag. Filled only for statistics
            endpoints
          format: int64
          example: 10
      description: List of all category tags for the reservation associated with this
        review
    ApiReviewDTO:
      type: object
      properties:
        id:
          type: integer
          description: Reference inside our system
          format: int64
          example: 17
        externalId:
          type: string
          description: Reference inside the external system
          example: "123"
        insertTime:
          type: string
          description: The expiration time in UTC (ISO8601)
          format: date-time
          example: 2022-05-01T15:31:54.456Z
        updateTime:
          type: string
          description: The expiration time in UTC (ISO8601)
          format: date-time
          example: 2022-05-01T15:31:54.456Z
        channelInsertTime:
          type: string
          description: "The time the review was first completed on the channel (UTC,\
            \ ISO8601)"
          format: date-time
          example: 2022-05-01T15:31:54.456Z
        rating:
          type: number
          description: Guest rates the overall quality of the stay
          format: double
          example: 5.0
        refer:
          type: string
          description: The reservation confirmation code
          example: ABC123
        reviewerRole:
          type: string
          description: Role of the reviewee. Guest or Host
          example: HOST
          enum:
          - HOST
          - GUEST
          - ACCOMODATION
        expiresAt:
          type: string
          description: The expiration time in UTC (ISO8601)
          format: date-time
          example: 2022-05-01T15:31:54.456Z
        status:
          type: string
          description: The status of the review
          example: REVIEW_CREATED
          enum:
          - REVIEW_CREATED
          - REVIEW_SUBMITTED
          - REVIEW_PUBLISHED
          - REVIEW_EXPIRED
          - REVIEW_RESPONSE_SUBMITTED
          - UNKWNOWN
          - REJECTED
          - APPROVED
          - REVIEW_DISCARDED
        headline:
          type: string
          description: The headline of the review
          example: Test
        publicReview:
          type: string
          description: Public comment left by reviewer
          example: Test
        privateReview:
          type: string
          description: Private comment left by reviewer. This information is not publicly
            visible. It is often used to offer suggestions for improvement.
          example: Test
        revieweeResponse:
          type: string
          description: Reviewee's response to the review
          example: Test
        listingId:
          type: string
          description: External id of the room linked to this review
          example: "521443654646057653"
        reviewCategories:
          type: array
          description: List of all category ratings for the reservation associated
            with this review
          items:
            $ref: "#/components/schemas/ApiReviewCategoryDTO"
        isRevieweeRecommended:
          type: boolean
          description: Indicates whether this host would recommend this guest to other
            hosts
          example: true
    ChatAttachmentDTO:
      required:
      - id
      - name
      - size
      - type
      type: object
      properties:
        id:
          type: integer
          description: Reference inside our system
          format: int64
          example: 17
        name:
          type: string
          description: The name of this attachment
          example: image.jpg
        type:
          type: string
          description: The type of this attachment
          example: JPEG
          enum:
          - JPEG
          - PNG
          - OCTET_STREAM
        url:
          type: string
          description: The url of this attachment
          example: http://mysite.com/image.jpg
        previewUrl:
          type: string
          description: The preview of this item
          example: http://mysite.com/thumb/image.jpg
        content:
          type: string
          description: The base64 string of this attachment content. Used only for
            the upload
        sortOrder:
          type: integer
          description: Sorting of this photo
          format: int32
          readOnly: true
          example: 12
        repository:
          type: string
          description: Repository Type
          example: ROOM
          enum:
          - ROOM
          - PROPERTY
          - CHAT
        error:
          type: string
          description: "Error of this photo, in case the system was not able to upload\
            \ it"
          readOnly: true
          example: "12"
        messageId:
          type: integer
          description: The message linked to this attachment
          format: int64
          example: 17
        propertyId:
          type: integer
          description: The property linked to this attachment
          format: int64
          example: 16997
        size:
          type: integer
          description: The size of this attachment in bytes
          format: int64
          example: 1024
        expire:
          type: string
          description: The expire date in system time (ISO8601) of this attachment
          format: date
          example: 2022-05-01
        external:
          type: boolean
          description: Indicates if the file is hosted by Octorate
          example: true
      description: The attachment of this chat message
      example:
        id: 17
        messageId: 17
        name: image.jpg
        type: image/jpeg
        size: 1024
        content:
          id: 17
          attachmentId: 17
          expire: 2022-05-01
          content: '...'
    ChatMessageAttributeDTO:
      required:
      - messageId
      - value
      type: object
      properties:
        id:
          type: integer
          description: Reference inside our system
          format: int64
          example: 17
        messageId:
          type: integer
          description: The message linked to this attribute
          format: int64
          example: 17
        type:
          type: string
          description: The type of this attribute
          example: TEXT
          enum:
          - TEXT
          - MAIL_TEMPLATE_ID
          - ERROR_MESSAGE
          - OTA_FLOW_DIRECTION
          - REFER
          - MOBILE_PHONE
          - LANGUAGE
          - MESSAGES_LABEL_NAME
          - HIDE_SYSTEM_MESSAGE_TO
          - APP_NOTIFIED
          - TRANSLATION_MAP
          - AI_SKIP_DISABLE
        value:
          type: string
          description: The value of this attribute
          example: Hello world!
      description: Attributes of this chat message
      example:
      - id: 65
        messageId: 61
        type: TEXT
        value: Hello world!
    ChatMessageDTO:
      required:
      - createTime
      - externalThreadId
      - processor
      - sender
      - status
      - threadId
      type: object
      properties:
        id:
          type: integer
          description: Reference inside our system
          format: int64
          example: 17
        sender:
          $ref: "#/components/schemas/PersonDTO"
        threadId:
          type: integer
          description: The chat thread linked to this message
          format: int64
          example: 17
        externalThreadId:
          type: string
          description: The chat thread id inside the external portal
          example: "17"
        createTime:
          type: string
          description: The create time in UTC (ISO8601) of this chat message
          format: date-time
          example: 2022-05-01T15:31:54.456Z
        sentTime:
          type: string
          description: The sent time in UTC (ISO8601) of this chat message
          format: date-time
          example: 2022-05-01T15:31:54.456Z
        status:
          type: string
          description: The status of this chat message
          example: SENT
          enum:
          - CREATED
          - WAIT_AUTH
          - SENT
          - ERROR
          - MANUAL_VERIFY
        processor:
          type: string
          description: the processor of this chat message
          example: DIRECT
          enum:
          - DIRECT
          - WHATSAPP
          - CHANNEL
          - WHATSAPP_MANUAL
          - MAIL
          - NOTE
        externalId:
          type: string
          description: External id of this message
          example: 0000e7ae-b79b-11ec-a2b5-199d8f8d3242
        attributes:
          uniqueItems: true
          type: array
          description: Attributes of this chat message
          example:
          - id: 65
            messageId: 61
            type: TEXT
            value: Hello world!
          items:
            $ref: "#/components/schemas/ChatMessageAttributeDTO"
        readers:
          type: array
          description: Readers of this chat message
          example:
          - id: 56
            messageId: 90
            readTime: 2022-04-29T09:12:13.000Z
            reader:
              email: mario.rossi@octorate.com
              firstname: Mario
              fullname: Rossi Mario
              guestId: 12345
              id: 54
              lastname: Rossi
          items:
            $ref: "#/components/schemas/ChatMessageReaderDTO"
        attachment:
          $ref: "#/components/schemas/ChatAttachmentDTO"
        specialOffer:
          $ref: "#/components/schemas/SpecialOfferDTO"
        review:
          $ref: "#/components/schemas/ApiReviewDTO"
        currentAccommodations:
          type: array
          description: List of current accommodations for the chat message
          example:
          - "112696"
          - "16997"
          items:
            type: string
            description: List of current accommodations for the chat message
            example: "[\"112696\",\"16997\"]"
        externalSender:
          $ref: "#/components/schemas/PersonDTO"
        readTime:
          type: string
          format: date-time
    ChatMessageReaderDTO:
      required:
      - messageId
      - readTime
      - reader
      type: object
      properties:
        id:
          type: integer
          description: Reference inside our system
          format: int64
          example: 17
        messageId:
          type: integer
          description: The message linked to this reader
          format: int64
          example: 17
        reader:
          $ref: "#/components/schemas/PersonDTO"
        readTime:
          type: string
          description: The read time in UTC (ISO8601)
          format: date-time
          example: 2022-05-01T15:31:54.456Z
      description: Readers of this chat message
      example:
      - id: 56
        messageId: 90
        readTime: 2022-04-29T09:12:13.000Z
        reader:
          email: mario.rossi@octorate.com
          firstname: Mario
          fullname: Rossi Mario
          guestId: 12345
          id: 54
          lastname: Rossi
    PermissionsDTO:
      required:
      - admin
      - adminApi
      - adminCodPromo
      - adminDylog
      - adminSettings
      - adminStats
      - adminText
      - adminUsers
      - assignCodPromo
      - availability
      - billing
      - cashClosing
      - chat
      - checkIn
      - houseKeeping
      - invoices
      - license
      - prices
      - reservations
      - rooms
      - settings
      - source
      - stats
      - subscription
      - support
      - users
      type: object
      properties:
        prices:
          type: string
          description: The prices permission level
          example: READONLY
          enum:
          - NONE
          - READWRITE
          - READONLY
        adminStats:
          type: string
          description: The adminStats permission level
          example: READONLY
          enum:
          - NONE
          - READWRITE
          - READONLY
        adminUsers:
          type: string
          description: The adminUsers permission level
          example: READONLY
          enum:
          - NONE
          - READWRITE
          - READONLY
        adminApi:
          type: string
          description: The adminApi permission level
          example: READONLY
          enum:
          - NONE
          - READWRITE
          - READONLY
        adminSettings:
          type: string
          description: The adminSettings permission level
          example: READONLY
          enum:
          - NONE
          - READWRITE
          - READONLY
        adminDylog:
          type: string
          description: The adminDylog permission level
          example: READONLY
          enum:
          - NONE
          - READWRITE
          - READONLY
        reservations:
          type: string
          description: The reservations permission level
          example: READONLY
          enum:
          - NONE
          - READWRITE
          - READONLY
        availability:
          type: string
          description: The availability permission level
          example: READONLY
          enum:
          - NONE
          - READWRITE
          - READONLY
        settings:
          type: string
          description: The settings permission level
          example: READONLY
          enum:
          - NONE
          - READWRITE
          - READONLY
        billing:
          type: string
          description: The billing permission level
          example: READONLY
          enum:
          - NONE
          - READWRITE
          - READONLY
        cashClosing:
          type: string
          description: The cashClosing permission level
          example: READONLY
          enum:
          - NONE
          - READWRITE
          - READONLY
        rooms:
          type: string
          description: The rooms permission level
          example: READONLY
          enum:
          - NONE
          - READWRITE
          - READONLY
        users:
          type: string
          description: The users permission level
          example: READONLY
          enum:
          - NONE
          - READWRITE
          - READONLY
        stats:
          type: string
          description: The stats permission level
          example: READONLY
          enum:
          - NONE
          - READWRITE
          - READONLY
        invoices:
          type: string
          description: The invoices permission level
          example: READONLY
          enum:
          - NONE
          - READWRITE
          - READONLY
        admin:
          type: string
          description: The admin permission level
          example: READONLY
          enum:
          - NONE
          - READWRITE
          - READONLY
        adminCodPromo:
          type: string
          description: The adminCodPromo permission level
          example: READONLY
          enum:
          - NONE
          - READWRITE
          - READONLY
        support:
          type: string
          description: The support permission level
          example: READONLY
          enum:
          - NONE
          - READWRITE
          - READONLY
        subscription:
          type: string
          description: The subscription permission level
          example: READONLY
          enum:
          - NONE
          - READWRITE
          - READONLY
        assignCodPromo:
          type: string
          description: The assignCodPromo permission level
          example: READONLY
          enum:
          - NONE
          - READWRITE
          - READONLY
        source:
          type: string
          description: The source permission level
          example: READONLY
          enum:
          - NONE
          - READWRITE
          - READONLY
        checkIn:
          type: string
          description: The checkIn permission level
          example: READONLY
          enum:
          - NONE
          - READWRITE
          - READONLY
        houseKeeping:
          type: string
          description: The houseKeeping permission level
          example: READONLY
          enum:
          - NONE
          - READWRITE
          - READONLY
        adminText:
          type: string
          description: The adminText permission level
          example: READONLY
          enum:
          - NONE
          - READWRITE
          - READONLY
        chat:
          type: string
          description: The chat permission level
          example: READONLY
          enum:
          - NONE
          - READWRITE
          - READONLY
        license:
          type: string
          description: The license permission level
          example: READONLY
          enum:
          - NONE
          - READWRITE
          - READONLY
        sensitiveData:
          type: string
          description: The sensitive data access permission
          example: READONLY
          enum:
          - NONE
          - READWRITE
          - READONLY
        octosite:
          type: string
          description: The Octosite management permission
          example: READONLY
          enum:
          - NONE
          - READWRITE
          - READONLY
        channelManager:
          type: string
          description: The ChannelManager permission
          example: READONLY
          enum:
          - NONE
          - READWRITE
          - READONLY
        contactInfo:
          type: string
          description: The phone and email access permission
          example: READONLY
          enum:
          - NONE
          - READWRITE
          - READONLY
      description: The permissions of this person (only if user)
      example:
        chat: READONLY
        checkIn: NONE
        invoices: READWRITE
    PersonDTO:
      required:
      - id
      type: object
      properties:
        id:
          type: integer
          description: Reference inside our system
          format: int64
          example: 17
        userId:
          type: integer
          description: Reference of the User linked to this Person.
          format: int64
          example: 4
        guestId:
          type: integer
          description: Reference of the Guest linked to this Person
          format: int64
          example: 5
        externalGuest:
          type: string
          description: "Reference of the external guest inside the external site.\
            \ It's used to map the message to a specific guest. Set it up if coming\
            \ from the guest, leave null if coming from the property"
          example: A-123
        email:
          type: string
          description: The email of this Person
          example: mario.rossi@octorate.com
        phone:
          type: string
          description: The phone number of this Person (only if guest)
          example: +39 3461234567
        username:
          type: string
          description: The username of this Person (only if user)
          example: mario_rossi
        firstname:
          type: string
          description: The firstname of this Person
          example: Mario
        lastname:
          type: string
          description: The lastname of this Person
          example: Rossi
        fullname:
          type: string
          description: A user friendly string to describe this Person
          example: Rossi Mario
        photo:
          type: string
          description: The absolute URL of the avatar of this Person (only if user)
          example: https://resx.octorate.com/content/userphotos/1647609985065.jpg
        preferredLanguage:
          type: string
          description: The preferred language of this person
          example: EN
          enum:
          - IT
          - EN
          - FR
          - ES
          - DE
          - RU
          - PT
          - NL
          - JA
          - EL
          - TR
          - ZH
          - CA
          - RO
        preferredAccommodation:
          type: string
          description: The preferred accommodation after login
          example: EN
        permissions:
          $ref: "#/components/schemas/PermissionsDTO"
        hideReadThreads:
          type: boolean
          description: Indicates if the user want to hide already read thread in chat
            (only if user)
          example: true
        showArchivedThreads:
          type: boolean
          description: Indicates if the user want to show archived thread in chat
            (only if user)
          example: true
        userType:
          type: string
          description: The user type (only if user)
          example: "true"
          enum:
          - USER
          - ADMIN
          - AFFILIATE
        adminDepartment:
          type: string
          description: The department of this person (only if admin user)
          example: DEVELOPER
          enum:
          - SALES
          - SUPPORT
          - DEVELOPER
        mfaEnabled:
          type: boolean
          description: MultiFactor Authentication is enabled?
          example: true
        dashboardWidgetTypes:
          type: array
          description: The selected dashboard widget types (only if user and not admin)
          items:
            type: string
            description: The selected dashboard widget types (only if user and not
              admin)
            enum:
            - RESERVATION_DAY_BEFORE
            - RESERVATION_PER_CHANNEL
            - RESERVATION_LENGHT_STAY
            - RESERVATION_PRICE_CHANNEL
            - MOST_BOOKED_DAYS
            - YESTERDAY_RESERVATION
            - COMPARE_WEEKS
            - CONVERSION_RATE
            - BOOKING_VIEWS_ROOMS
            - RESERVATION_DIRECT_INDIRECT
            - RMS_REVENUE_BY_SOURCE_MONTH
            - RMS_YESTERDAY_MOST_BOOKED
            - RMS_PACE_COMPARISON
            - RMS_DIRECT_VS_INDIRECT
            - REVIEW_STATS
            - REVIEW_CATEGORY_TAGS
            - AVERAGE_DAILY_RATE
        lastLogin:
          $ref: "#/components/schemas/ApiLogDTO"
        accessibleAccommodations:
          type: array
          description: The list of accommodations accessible by this person
          items:
            type: string
            description: The list of accommodations accessible by this person
    SpecialOfferDTO:
      type: object
      properties:
        id:
          type: integer
          description: Reference inside our system
          format: int64
          example: 17
        offerType:
          type: string
          enum:
          - SPECIAL_OFFER
          - PREAPPROVAL
        listingId:
          type: string
          description: External id of the room linked to this special offer
          example: "521443654646057653"
        startDate:
          type: string
          description: The start date in system time (ISO8601) of this special offer
          format: date
          example: 2022-05-01
        nights:
          type: integer
          description: The nights of this special offer
          format: int32
          example: 3
        numberOfAdults:
          type: integer
          description: The number of adults of this special offer
          format: int32
          example: 3
        numberOfChildren:
          type: integer
          description: The number of children of this special offer
          format: int32
          example: 3
        numberOfInfants:
          type: integer
          description: The number of infants of this special offer
          format: int32
          example: 3
        totalPrice:
          type: integer
          description: The price of this special offer
          format: int32
          example: 300
        blockInstantBooking:
          type: boolean
          description: Indicates whether this offer blocks rooms for the dates of
            the offer
          example: false
        nativeCurrency:
          type: string
          description: The currency of this special offer
          example: EUR
        createdAt:
          type: string
          description: The creation time in UTC (ISO8601)
          format: date-time
          example: 2022-05-01T15:31:54.456Z
        expiresAt:
          type: string
          description: The expiration time in UTC (ISO8601)
          format: date-time
          example: 2022-05-01T15:31:54.456Z
        isActive:
          type: boolean
          description: Indicates whether this offer is active
          example: true
        rescindedAt:
          type: string
          description: The rescinded time in UTC (ISO8601)
          format: date-time
          example: 2022-05-01T15:31:54.456Z
        chatMessageId:
          type: integer
          description: The chat message linked to this special offer
          format: int64
          example: 17
    ApiAccommodationLight:
      required:
      - name
      type: object
      properties:
        id:
          type: string
          description: Reference inside our system
          example: "16997"
        name:
          type: string
          description: Name of the accommodation
          readOnly: true
          example: Manhattan Hotel
        currency:
          type: string
          description: Currency of this property
          example: EUR
        timeZone:
          type: object
          properties:
            displayName:
              type: string
            id:
              type: string
            dstsavings:
              type: integer
              format: int32
            rawOffset:
              type: integer
              format: int32
          description: Time zone of the property
          readOnly: true
        timeZoneOffset:
          type: string
          description: Offset of the time zone of the property
          readOnly: true
        phoneNumber:
          type: string
          description: Phone number of the property
          readOnly: true
        address:
          type: string
          description: Address of the property
          readOnly: true
        latitude:
          type: number
          description: Latitude of the property
          format: double
          readOnly: true
        longitude:
          type: number
          description: Longitude of the property
          format: double
          readOnly: true
        zipCode:
          type: string
          description: ZipCode of the property
          readOnly: true
        city:
          type: string
          description: City of the property
          readOnly: true
        checkinStart:
          type: integer
          description: Checkin time of the property
          format: int32
        checkinEnd:
          type: integer
          description: Checkin time of the property
          format: int32
        checkout:
          type: integer
          description: Checkout time of the property
          format: int32
      description: Original accommodation this reservation was assigned
    ApiInvoicePayoffDTO:
      type: object
      properties:
        id:
          type: integer
          description: Octorate ID of this item
          format: int64
          readOnly: true
        insertDate:
          type: string
          description: Insert time of this payoff
          format: date-time
          readOnly: true
        amount:
          type: number
          description: The amount of this payoff
        amountCity:
          type: number
          description: The city amount of this payoff
        paymentId:
          type: integer
          description: The payment id related to this payoff
          format: int64
        invoiceItemId:
          type: integer
          description: The invoice item id related to this payoff
          format: int64
        invoiceId:
          type: integer
          description: The invoice id related to this payoff
          format: int64
        paymentMode:
          type: string
          description: The payment mode of this payoff
          enum:
          - UNKNOWN
          - CASH
          - CREDITCARD
          - PREPAID
          - BANKTRANSFER
          - NOTPAID
          - PAYPAL
          - CHEQUE
          - TRAVELCHEQUE
          - TREASURY_OFFICE
          - BONCADEAU
          - TREASURY_RECEIPT
          - COMMISSION
        description:
          type: string
          description: The description of this payoff
        hidden:
          type: boolean
          description: True if this payoff is hidden
      description: The list of payoff of the payment.
    ApiObjectLight:
      type: object
      properties:
        id:
          type: integer
          format: int64
        name:
          type: string
      description: Original connection of this reservation
    ApiReservationCard:
      type: object
      properties:
        cardId:
          type: integer
          format: int64
        token:
          type: string
          description: Secret Secure Token that allows to process payment on this
            card. This token should be encrypted on your side. There is a specific
            permission to access this token
          example: a2uuy-uuyte-76433-hyt453-kkssst
        detokenizationUrl:
          type: string
          description: Detokenization URL. Shown only on some particular API methods
          readOnly: true
          example: https://api.octorate.com/showmycard
        detokenizationIframe:
          type: boolean
          description: Detokenization URL can be open in iframe?
        bank:
          type: string
          description: Bank issuer of this card
          example: ING DIRECT Bv.
        type:
          type: string
          description: "Which type of card is this? Credit, Debit? Virtual?"
          enum:
          - UNKNOW
          - VIRTUAL
          - PHYSICAL_DEVICE
          - DEBIT
          - CREDIT
        bankCountry:
          type: string
          description: Country of the bank
          example: IT
          enum:
          - AF
          - AX
          - AL
          - DZ
          - AS
          - AD
          - AO
          - AI
          - AQ
          - AG
          - AR
          - AM
          - AW
          - AU
          - AT
          - AZ
          - BS
          - BH
          - BD
          - BB
          - BY
          - BE
          - BZ
          - BJ
          - BM
          - BT
          - BO
          - BQ
          - BA
          - BW
          - BV
          - BR
          - IO
          - BN
          - BG
          - BF
          - BI
          - KH
          - CM
          - CA
          - CV
          - KY
          - CF
          - TD
          - CL
          - CN
          - CX
          - CC
          - CO
          - KM
          - CG
          - CD
          - CK
          - CR
          - CI
          - HR
          - CU
          - CW
          - CY
          - CZ
          - DK
          - DJ
          - DM
          - DO
          - EC
          - EG
          - SV
          - GQ
          - ER
          - EE
          - ET
          - FK
          - FO
          - FJ
          - FI
          - FR
          - GF
          - PF
          - TF
          - GA
          - GM
          - GE
          - DE
          - GH
          - GI
          - GR
          - GL
          - GD
          - GP
          - GU
          - GT
          - GG
          - GN
          - GW
          - GY
          - HT
          - HM
          - VA
          - HN
          - HK
          - HU
          - IS
          - IN
          - ID
          - IR
          - IQ
          - IE
          - IM
          - IL
          - IT
          - JM
          - JP
          - JE
          - JO
          - KZ
          - KE
          - KI
          - KP
          - KR
          - KW
          - KG
          - LA
          - LV
          - LB
          - LS
          - LR
          - LY
          - LI
          - LT
          - LU
          - MO
          - MK
          - MG
          - MW
          - MY
          - MV
          - ML
          - MT
          - MH
          - MQ
          - MR
          - MU
          - YT
          - MX
          - FM
          - MD
          - MC
          - MN
          - ME
          - MS
          - MA
          - MZ
          - MM
          - NA
          - NR
          - NP
          - NL
          - NC
          - NZ
          - NI
          - NE
          - NG
          - NU
          - NF
          - MP
          - "NO"
          - OM
          - PK
          - PW
          - PS
          - PA
          - PG
          - PY
          - PE
          - PH
          - PN
          - PL
          - PT
          - PR
          - QA
          - RE
          - RO
          - RU
          - RW
          - BL
          - SH
          - KN
          - LC
          - MF
          - PM
          - VC
          - WS
          - SM
          - ST
          - SA
          - SN
          - RS
          - SC
          - SL
          - SG
          - SX
          - SK
          - SI
          - SB
          - SO
          - ZA
          - GS
          - SS
          - ES
          - LK
          - SD
          - SR
          - SJ
          - SZ
          - SE
          - CH
          - SY
          - TW
          - TJ
          - TZ
          - TH
          - TL
          - TG
          - TK
          - TO
          - TT
          - TN
          - TR
          - TM
          - TC
          - TV
          - UG
          - UA
          - AE
          - GB
          - US
          - UM
          - UY
          - UZ
          - VU
          - VE
          - VN
          - VG
          - VI
          - WF
          - EH
          - YE
          - ZM
          - ZW
          - XJ
        scheme:
          type: string
          description: "Schema of this card (i.e. AMEX, VISA)"
          example: MASTERCARD
          enum:
          - VISA
          - MASTERCARD
          - AMERICAN_EXPRESS
          - DINERS_CLUB
          - JCB
          - DISCOVER
          - OTHER
        activationDate:
          type: string
          description: Activation date of this card (If null no date)
          format: date-time
          example: 2019-12-10T11:03:00Z
        expireDate:
          type: string
          description: Expire date of this card
          format: date-time
          example: 2019-12-10T11:03:00Z
        lastUpdate:
          type: string
          description: Last update date of the card or the processing informations
            on it
          format: date-time
          example: 2019-12-10T11:03:00Z
        cvvDetailsAvailable:
          type: boolean
          description: "Are details about CVV available? If this flag is false cvvAvailable,\
            \ cvvReceived, cvvCleared and cvvClearedDate will always be false"
        cvvAvailable:
          type: boolean
          description: status of the CVV (ony if cvvDetailsAvailable is true)
        cvvReceived:
          type: boolean
          description: cvv received (ony if cvvDetailsAvailable is true)
        cvvCleared:
          type: boolean
          description: Whether CVV has been used at least one time (so it was cleared)
            (ony if cvvDetailsAvailable is true)
        cvvClearedDate:
          type: string
          description: The time when the CVV has been cleared (ony if cvvDetailsAvailable
            is true)
          format: date-time
        cardVirtual:
          type: boolean
          description: "Has been this card marked as virtual? Some OTAs can notify\
            \ us that the card they are giving is virtual, in this case we mark this\
            \ flag"
          readOnly: true
        prepaid:
          type: boolean
          description: Is this card prepaid?
        cardStatus:
          type: string
          description: Card Status if the reservation has one
          readOnly: true
          example: CREDITCARD
          enum:
          - UNKNOWN
          - NOT_VALIDATED
          - INVALID
          - VALID
          - MANDATE
          - _PAYED
        lastProcessorError:
          type: string
          description: 'Last processor error is the field that defined the last known
            error '
        lastProcessorErrorDate:
          type: string
          description: The date of the last processor error
          format: date-time
        last4:
          type: string
          description: The last 4 digits of the Primary Account Number (PAN) of the
            credit card
        paymentProcessor:
          type: string
          description: Current processor of this credit card
          enum:
          - SYSPAY
          - STRIPE
          - NONE
          - PAYULATAM
          - PAYBYPAGO
          - ADDONPAYMENTS
          - NOT_USED_ASIAPAY_PESOPAY
          - NOT_USED_ASIAPAY_PAYDOLLAR
          - NOT_USED_ASIAPAY_SIAMPAY
          - DUMMY_PROCESSOR
          - NEXI
          - NOT_USED_PAYWAY
          - NOT_USED_OPAYO
          - CMI
          - MERCADOPAGO
          - STRIPE_CARD_PRESENTED
          - AZUL
          - REDSYS
        detokenizationEnabled:
          type: boolean
          description: If true we can detokenize this card
        chargeable:
          type: boolean
          description: If true this card is chargeable
        preauthorizable:
          type: boolean
          description: If true this card is preauthorizable
        amount:
          type: number
          description: The amount allowed to debit on this card (initial balance)
      description: The Credit card linked to this payment if any
    ApiReservationComponent:
      type: object
      properties:
        type:
          type: string
          description: Type of this component of the price
          example: DAILY_ROOM_PRICE
          enum:
          - DAILY_ROOM_PRICE
          - ROOM_NET
          - VAT
          - EXTRA
          - CLEANING
          - DISCOUNT
          - COMMISSION
          - TOURIST_TAX
          - BREAKFAST
        createTime:
          type: string
          description: Create time of this item
          format: date-time
        productionDate:
          type: string
          description: Production Date of this item
          format: date-time
        day:
          type: string
          description: Day as this item refer
          format: date-time
        price:
          type: number
          description: Price of this item
          example: 122.0
        quantity:
          type: integer
          description: "Quantity of this item. It can be null, in this case it means\
            \ that is uncountable"
          format: int32
          example: 4
        name:
          type: string
          description: Assigned name to this item
          example: Coffee
        reference:
          type: string
          description: Unique reference to this item
          example: "12312312"
        product:
          type: integer
          description: Relative Model or product
          format: int64
          example: 122122
        externalId:
          type: string
          description: External Provided key if available
        included:
          type: boolean
        manual:
          type: boolean
        octorateExtraId:
          type: integer
          format: int64
        group:
          type: boolean
      description: "Combined list of all the elements creating the price breakdown,\
        \ @see ApiComponentType for a list of values. Actually we support only extras\
        \ adding/updating, other fields are readonly"
      readOnly: true
    ApiReservationGuestDTO:
      required:
      - checkin
      - checkout
      - familyName
      - givenName
      - sex
      - type
      type: object
      properties:
        id:
          type: integer
          description: Readonly guest id. This id is given only if a 'police record
            guest' is saved
          format: int64
          example: 123123
        type:
          type: string
          description: Describes if this guest is who has been registered when booking
            process has done or it's a registered guest. As new police guests you
            can register only 'GUEST'
          example: BOOKER
          enum:
          - BOOKER
          - GUEST
        accommodatedType:
          type: string
          description: What is the relationship between the guests of the reservation?
          example: MAIN
          enum:
          - SINGLE_GUEST
          - HEAD_OF_FAMILY
          - HEAD_OF_GROUP
          - RELATIVE
          - MEMBER_GROUP
          default: "The first one will be automatically set as head of family, the\
            \ others as relatives if null"
        source:
          type: string
          description: "The source of this record, Readable only, api records will\
            \ be inserted as \" API \""
          readOnly: true
          example: API
          enum:
          - OTHER
          - USER
          - PORTAL
          - WEBCHECKIN
          - APP
          - API
          - SYSTEM
        givenName:
          type: string
          description: Name of the guest
          example: Mario
        familyName:
          type: string
          description: Last name of the guest
          example: Rossi
        customerName:
          type: string
          description: Customer name. This field should not contain guest name but
            other info like company or agency name
        checkin:
          type: string
          description: Date of the checkin of this guest in format yyyy-MM-dd
          example: 2019-12-17
        checkout:
          type: string
          description: Date of the checkout of this guest in format yyyy-MM-dd
          example: 2019-12-17
        birthDate:
          type: string
          description: Birth date of the guest. Can range to TODAY minus 110 years
            to TODAY
          format: date
          example: 1992-10-22
        birthCountry:
          type: string
          description: Birth country in ISO code.
          example: IT
          enum:
          - AF
          - AX
          - AL
          - DZ
          - AS
          - AD
          - AO
          - AI
          - AQ
          - AG
          - AR
          - AM
          - AW
          - AU
          - AT
          - AZ
          - BS
          - BH
          - BD
          - BB
          - BY
          - BE
          - BZ
          - BJ
          - BM
          - BT
          - BO
          - BQ
          - BA
          - BW
          - BV
          - BR
          - IO
          - BN
          - BG
          - BF
          - BI
          - KH
          - CM
          - CA
          - CV
          - KY
          - CF
          - TD
          - CL
          - CN
          - CX
          - CC
          - CO
          - KM
          - CG
          - CD
          - CK
          - CR
          - CI
          - HR
          - CU
          - CW
          - CY
          - CZ
          - DK
          - DJ
          - DM
          - DO
          - EC
          - EG
          - SV
          - GQ
          - ER
          - EE
          - ET
          - FK
          - FO
          - FJ
          - FI
          - FR
          - GF
          - PF
          - TF
          - GA
          - GM
          - GE
          - DE
          - GH
          - GI
          - GR
          - GL
          - GD
          - GP
          - GU
          - GT
          - GG
          - GN
          - GW
          - GY
          - HT
          - HM
          - VA
          - HN
          - HK
          - HU
          - IS
          - IN
          - ID
          - IR
          - IQ
          - IE
          - IM
          - IL
          - IT
          - JM
          - JP
          - JE
          - JO
          - KZ
          - KE
          - KI
          - KP
          - KR
          - KW
          - KG
          - LA
          - LV
          - LB
          - LS
          - LR
          - LY
          - LI
          - LT
          - LU
          - MO
          - MK
          - MG
          - MW
          - MY
          - MV
          - ML
          - MT
          - MH
          - MQ
          - MR
          - MU
          - YT
          - MX
          - FM
          - MD
          - MC
          - MN
          - ME
          - MS
          - MA
          - MZ
          - MM
          - NA
          - NR
          - NP
          - NL
          - NC
          - NZ
          - NI
          - NE
          - NG
          - NU
          - NF
          - MP
          - "NO"
          - OM
          - PK
          - PW
          - PS
          - PA
          - PG
          - PY
          - PE
          - PH
          - PN
          - PL
          - PT
          - PR
          - QA
          - RE
          - RO
          - RU
          - RW
          - BL
          - SH
          - KN
          - LC
          - MF
          - PM
          - VC
          - WS
          - SM
          - ST
          - SA
          - SN
          - RS
          - SC
          - SL
          - SG
          - SX
          - SK
          - SI
          - SB
          - SO
          - ZA
          - GS
          - SS
          - ES
          - LK
          - SD
          - SR
          - SJ
          - SZ
          - SE
          - CH
          - SY
          - TW
          - TJ
          - TZ
          - TH
          - TL
          - TG
          - TK
          - TO
          - TT
          - TN
          - TR
          - TM
          - TC
          - TV
          - UG
          - UA
          - AE
          - GB
          - US
          - UM
          - UY
          - UZ
          - VU
          - VE
          - VN
          - VG
          - VI
          - WF
          - EH
          - YE
          - ZM
          - ZW
          - XJ
        birthCity:
          type: string
          description: "The city in the customer locale. If we have not yet registered\
            \ the value for the country, we might accept any value"
          example: ROMA
        residenceCountry:
          type: string
          description: The place where the guest has now the residence
          example: IT
          enum:
          - AF
          - AX
          - AL
          - DZ
          - AS
          - AD
          - AO
          - AI
          - AQ
          - AG
          - AR
          - AM
          - AW
          - AU
          - AT
          - AZ
          - BS
          - BH
          - BD
          - BB
          - BY
          - BE
          - BZ
          - BJ
          - BM
          - BT
          - BO
          - BQ
          - BA
          - BW
          - BV
          - BR
          - IO
          - BN
          - BG
          - BF
          - BI
          - KH
          - CM
          - CA
          - CV
          - KY
          - CF
          - TD
          - CL
          - CN
          - CX
          - CC
          - CO
          - KM
          - CG
          - CD
          - CK
          - CR
          - CI
          - HR
          - CU
          - CW
          - CY
          - CZ
          - DK
          - DJ
          - DM
          - DO
          - EC
          - EG
          - SV
          - GQ
          - ER
          - EE
          - ET
          - FK
          - FO
          - FJ
          - FI
          - FR
          - GF
          - PF
          - TF
          - GA
          - GM
          - GE
          - DE
          - GH
          - GI
          - GR
          - GL
          - GD
          - GP
          - GU
          - GT
          - GG
          - GN
          - GW
          - GY
          - HT
          - HM
          - VA
          - HN
          - HK
          - HU
          - IS
          - IN
          - ID
          - IR
          - IQ
          - IE
          - IM
          - IL
          - IT
          - JM
          - JP
          - JE
          - JO
          - KZ
          - KE
          - KI
          - KP
          - KR
          - KW
          - KG
          - LA
          - LV
          - LB
          - LS
          - LR
          - LY
          - LI
          - LT
          - LU
          - MO
          - MK
          - MG
          - MW
          - MY
          - MV
          - ML
          - MT
          - MH
          - MQ
          - MR
          - MU
          - YT
          - MX
          - FM
          - MD
          - MC
          - MN
          - ME
          - MS
          - MA
          - MZ
          - MM
          - NA
          - NR
          - NP
          - NL
          - NC
          - NZ
          - NI
          - NE
          - NG
          - NU
          - NF
          - MP
          - "NO"
          - OM
          - PK
          - PW
          - PS
          - PA
          - PG
          - PY
          - PE
          - PH
          - PN
          - PL
          - PT
          - PR
          - QA
          - RE
          - RO
          - RU
          - RW
          - BL
          - SH
          - KN
          - LC
          - MF
          - PM
          - VC
          - WS
          - SM
          - ST
          - SA
          - SN
          - RS
          - SC
          - SL
          - SG
          - SX
          - SK
          - SI
          - SB
          - SO
          - ZA
          - GS
          - SS
          - ES
          - LK
          - SD
          - SR
          - SJ
          - SZ
          - SE
          - CH
          - SY
          - TW
          - TJ
          - TZ
          - TH
          - TL
          - TG
          - TK
          - TO
          - TT
          - TN
          - TR
          - TM
          - TC
          - TV
          - UG
          - UA
          - AE
          - GB
          - US
          - UM
          - UY
          - UZ
          - VU
          - VE
          - VN
          - VG
          - VI
          - WF
          - EH
          - YE
          - ZM
          - ZW
          - XJ
        city:
          type: string
          description: "The city in the customer locale. If we have not yet registered\
            \ the value for the country, we might accept any value"
          example: Roma
        email:
          type: string
          description: Email of the customer is validated against classic email regex
          example: myname@mycompany.com
        phone:
          type: string
          description: Main phone number including prefix
          example: "+39332554555"
        phoneAvailable:
          type: boolean
          description: True when a phone exists in DB but is masked for the Octorate
            frontend. External APIs always receive the real value.
        emailAvailable:
          type: boolean
          description: True when an email exists in DB but is masked for the Octorate
            frontend. External APIs always receive the real value.
        skipContactInfo:
          type: boolean
          description: "When true, the save endpoint will not overwrite phone and\
            \ email in DB. Set by the Octorate frontend when the user has not retrieved\
            \ the real contact info."
        address:
          type: string
          example: "15th Street, Manhattan, New York"
        zipCode:
          type: string
          example: "00022"
        language:
          type: string
          description: The language in the ISO2 CODE. Check SCHEMA for the values
            available
          example: IT
          externalDocs:
            url: https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes
          enum:
          - IT
          - EN
          - FR
          - ES
          - DE
          - RU
          - PT
          - NL
          - JA
          - EL
          - TR
          - ZH
          - CA
          - RO
        documentCode:
          type: string
          description: The document code
          example: AS3332DC
        documentType:
          type: string
          description: "The document type in the Police code of the country. ITALY:\
            \ PASOR o IDENT. SPAIN "
          example: Passport
        documentIssueDate:
          type: string
          description: Document issue date
          format: date
          example: 2020-10-01
        documentIssuePlace:
          type: string
          description: "In country locale, the city where this document has been issued"
          example: Roma
        nationality:
          type: string
          description: The country in the ISO2 Code. ALIAS ALSO FOR document issue
            country. Check SCHEMA for the values available
          example: IT
          externalDocs:
            url: https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes
          enum:
          - AF
          - AX
          - AL
          - DZ
          - AS
          - AD
          - AO
          - AI
          - AQ
          - AG
          - AR
          - AM
          - AW
          - AU
          - AT
          - AZ
          - BS
          - BH
          - BD
          - BB
          - BY
          - BE
          - BZ
          - BJ
          - BM
          - BT
          - BO
          - BQ
          - BA
          - BW
          - BV
          - BR
          - IO
          - BN
          - BG
          - BF
          - BI
          - KH
          - CM
          - CA
          - CV
          - KY
          - CF
          - TD
          - CL
          - CN
          - CX
          - CC
          - CO
          - KM
          - CG
          - CD
          - CK
          - CR
          - CI
          - HR
          - CU
          - CW
          - CY
          - CZ
          - DK
          - DJ
          - DM
          - DO
          - EC
          - EG
          - SV
          - GQ
          - ER
          - EE
          - ET
          - FK
          - FO
          - FJ
          - FI
          - FR
          - GF
          - PF
          - TF
          - GA
          - GM
          - GE
          - DE
          - GH
          - GI
          - GR
          - GL
          - GD
          - GP
          - GU
          - GT
          - GG
          - GN
          - GW
          - GY
          - HT
          - HM
          - VA
          - HN
          - HK
          - HU
          - IS
          - IN
          - ID
          - IR
          - IQ
          - IE
          - IM
          - IL
          - IT
          - JM
          - JP
          - JE
          - JO
          - KZ
          - KE
          - KI
          - KP
          - KR
          - KW
          - KG
          - LA
          - LV
          - LB
          - LS
          - LR
          - LY
          - LI
          - LT
          - LU
          - MO
          - MK
          - MG
          - MW
          - MY
          - MV
          - ML
          - MT
          - MH
          - MQ
          - MR
          - MU
          - YT
          - MX
          - FM
          - MD
          - MC
          - MN
          - ME
          - MS
          - MA
          - MZ
          - MM
          - NA
          - NR
          - NP
          - NL
          - NC
          - NZ
          - NI
          - NE
          - NG
          - NU
          - NF
          - MP
          - "NO"
          - OM
          - PK
          - PW
          - PS
          - PA
          - PG
          - PY
          - PE
          - PH
          - PN
          - PL
          - PT
          - PR
          - QA
          - RE
          - RO
          - RU
          - RW
          - BL
          - SH
          - KN
          - LC
          - MF
          - PM
          - VC
          - WS
          - SM
          - ST
          - SA
          - SN
          - RS
          - SC
          - SL
          - SG
          - SX
          - SK
          - SI
          - SB
          - SO
          - ZA
          - GS
          - SS
          - ES
          - LK
          - SD
          - SR
          - SJ
          - SZ
          - SE
          - CH
          - SY
          - TW
          - TJ
          - TZ
          - TH
          - TL
          - TG
          - TK
          - TO
          - TT
          - TN
          - TR
          - TM
          - TC
          - TV
          - UG
          - UA
          - AE
          - GB
          - US
          - UM
          - UY
          - UZ
          - VU
          - VE
          - VN
          - VG
          - VI
          - WF
          - EH
          - YE
          - ZM
          - ZW
          - XJ
        documentExpire:
          type: string
          description: The expiration of the document
          format: date-time
        sex:
          type: string
          example: MALE
          enum:
          - MALE
          - FEMALE
        addressLine1:
          type: string
          example: 98-120 Brooklyn Ave
        addressLine2:
          type: string
          example: 2nd line of address
        policeSentTime:
          type: string
          description: When was sent to the country police
          format: date-time
        policeSentStatus:
          type: boolean
          description: Was this record sent and what was the status?
        invoiceAgency:
          type: boolean
          description: Should we invoice to this agency?
        excludeCityTax:
          type: boolean
          description: Should exclude city tax when invoicing? It means that city
            tax is already paid from the channel
        excludeCityTaxAgency:
          type: boolean
          description: Should exclude city tax when invoicing to this agency?
        travelWay:
          type: string
          example: CAR
          enum:
          - NA
          - CAR
          - PLANE
          - PLANEBUS
          - PLANECAR
          - PLANETRAIN
          - TRAIN
          - BUS
          - CARAVAN
          - SHIP
          - MOTO
          - BICYCLE
          - WALK
          - OTHER
        plateNumber:
          type: string
          example: AB123CD
        tourismType:
          type: string
          example: BEACH_RESORT
          enum:
          - NOT_SPECIFIED
          - EDUCATIONAL
          - BEACH_RESORT
          - CONFERENCE
          - EXHIBITION
          - SPORTIVE
          - SCHOLAR
          - RELIGIOUS
          - SOCIAL
          - AMUSEMENT_PARK
          - THERMAL
          - FOODWINE
          - CYCLETURISM
          - EXCURSION_HIKING
          - OTHER
          - ART
          - PROFESSIONAL
          - HOLIDAY
          - FRIENDS
          - HEALTH
          - SHOPPING
          - TRANSIT
        degree:
          type: string
          example: UNIVERSITY_DEGREE
          enum:
          - NOT_SPECIFIED
          - PRIMARY_DIPLOMA
          - HIGH_DIPLOMA
          - UNIVERSITY_DEGREE
          - OTHER
          - MIDDLE_DIPLOMA
        travelRefer:
          type: string
          example: DIRECT_WEB
          enum:
          - NOT_SPECIFIED
          - DIRECT
          - DIRECT_WEB
          - NOT_DIRECT
          - NOT_DIRECT_WEB
          - OTHER
        draft:
          type: boolean
          description: Draft means the accommodation still want to have a look on
            it before sending to police
        validated:
          type: boolean
          description: Validated false means that this record has been inserted by
            the guest and the accommodation still needs to have a look into
        validatedDate:
          type: string
          description: The datetime when this record was validated by the accommodation
          format: date-time
        ageRange:
          type: string
          description: Age of the guest
          enum:
          - ADULT
          - CHILD
          - BABY
        cityTaxPrice:
          type: number
          description: City Tax Price for this guest
        cityTaxExemption:
          type: string
          description: City tax exemption for this guest
          enum:
          - TOO_YOUNG_RANGE2
          - HOSPITALISED
          - POLICE
          - DRIVER
          - TURIST_GUIDE
          - LONG_STAY
          - STUDY_RELATED
          - FESTIVALS
          - OTHER
          - HANDICAPPED
          - RESIDENCE_REASON
          - LOW_SEASON
          - EMERGENCY
          - HOSPITAL_HELPER
          - TOO_OLD
          - DISABLED_HELPER
          - HOTEL_WORKERS
          - EXEMPTION_WORKERS
          - FREQUENT_GUEST
          - WANT_NOT_PAY
          - PORTAL_PAID
          - TOO_YOUNG_RANGE1
          - WORK_STAY
          - SPIRITUAL_RETREAT
          - PET_CARE
          - INTERNATIONAL_PROTECTION
          - SEPARATED_PARENT
          - FAMILY_CAREGIVER
          - GENDER_VIOLENCE
          - PATIENT_PARENT
        cityTaxRelativeToGroup:
          type: boolean
          description: "If there is any city tax to pay, guests pays a city tax, this\
            \ flag indicates "
        systemGenerated:
          type: boolean
          description: "If true, the city tax of this guest is relative to group"
        cityRaw:
          type: string
          description: The city for colombian customer. We might accept any value
          example: Medellín
        previousCity:
          type: string
          description: The city of departure for colombian customer. We might accept
            any value
          example: Messico
        citizenship:
          type: string
          description: The citizenship of the guest in ISO code.
          example: IT
          enum:
          - AF
          - AX
          - AL
          - DZ
          - AS
          - AD
          - AO
          - AI
          - AQ
          - AG
          - AR
          - AM
          - AW
          - AU
          - AT
          - AZ
          - BS
          - BH
          - BD
          - BB
          - BY
          - BE
          - BZ
          - BJ
          - BM
          - BT
          - BO
          - BQ
          - BA
          - BW
          - BV
          - BR
          - IO
          - BN
          - BG
          - BF
          - BI
          - KH
          - CM
          - CA
          - CV
          - KY
          - CF
          - TD
          - CL
          - CN
          - CX
          - CC
          - CO
          - KM
          - CG
          - CD
          - CK
          - CR
          - CI
          - HR
          - CU
          - CW
          - CY
          - CZ
          - DK
          - DJ
          - DM
          - DO
          - EC
          - EG
          - SV
          - GQ
          - ER
          - EE
          - ET
          - FK
          - FO
          - FJ
          - FI
          - FR
          - GF
          - PF
          - TF
          - GA
          - GM
          - GE
          - DE
          - GH
          - GI
          - GR
          - GL
          - GD
          - GP
          - GU
          - GT
          - GG
          - GN
          - GW
          - GY
          - HT
          - HM
          - VA
          - HN
          - HK
          - HU
          - IS
          - IN
          - ID
          - IR
          - IQ
          - IE
          - IM
          - IL
          - IT
          - JM
          - JP
          - JE
          - JO
          - KZ
          - KE
          - KI
          - KP
          - KR
          - KW
          - KG
          - LA
          - LV
          - LB
          - LS
          - LR
          - LY
          - LI
          - LT
          - LU
          - MO
          - MK
          - MG
          - MW
          - MY
          - MV
          - ML
          - MT
          - MH
          - MQ
          - MR
          - MU
          - YT
          - MX
          - FM
          - MD
          - MC
          - MN
          - ME
          - MS
          - MA
          - MZ
          - MM
          - NA
          - NR
          - NP
          - NL
          - NC
          - NZ
          - NI
          - NE
          - NG
          - NU
          - NF
          - MP
          - "NO"
          - OM
          - PK
          - PW
          - PS
          - PA
          - PG
          - PY
          - PE
          - PH
          - PN
          - PL
          - PT
          - PR
          - QA
          - RE
          - RO
          - RU
          - RW
          - BL
          - SH
          - KN
          - LC
          - MF
          - PM
          - VC
          - WS
          - SM
          - ST
          - SA
          - SN
          - RS
          - SC
          - SL
          - SG
          - SX
          - SK
          - SI
          - SB
          - SO
          - ZA
          - GS
          - SS
          - ES
          - LK
          - SD
          - SR
          - SJ
          - SZ
          - SE
          - CH
          - SY
          - TW
          - TJ
          - TZ
          - TH
          - TL
          - TG
          - TK
          - TO
          - TT
          - TN
          - TR
          - TM
          - TC
          - TV
          - UG
          - UA
          - AE
          - GB
          - US
          - UM
          - UY
          - UZ
          - VU
          - VE
          - VN
          - VG
          - VI
          - WF
          - EH
          - YE
          - ZM
          - ZW
          - XJ
        familyRelationshipType:
          type: string
          description: The family relationship with the main guest
          enum:
          - GRANDFATHER
          - GREAT_GRANDFATHER
          - GREAT_GRANDSON
          - BROTHER_IN_LAW
          - SPOUSE
          - SON
          - BROTHER
          - GRANDSON
          - FATHER_OR_MOTHER
          - NEPHEW
          - FATHER_IN_LAW
          - UNCLE
          - SON_IN_LAW_OR_DAUGHTER_IN_LAW
          - CHILD_GUARDIAN
          - OTHER
        documentSupportNumber:
          type: string
          description: The document support number
        cityPoliceCode:
          type: string
          description: "The police code of the city, if this field is filled in the\
            \ creation of the guest, the city will be loaded from this code and not\
            \ by the City value"
    ApiReservationMetadataDTO:
      type: object
      properties:
        id:
          type: integer
          format: int64
        descriptorId:
          type: integer
          description: The associated meta descriptor inside our db
          format: int64
          readOnly: true
        labelText:
          type: string
          description: "the text to display to the customer, NOTE: This will affect\
            \ all the meta with the same key"
        metaKey:
          type: string
          description: this is the meta key to display to the customer when he need
            to select this value
        metaDataType:
          type: string
          description: "Describe here the type of data required, we will change the\
            \ presentation according to the type"
          enum:
          - TEXT
          - LINK
        value:
          type: string
          description: value for this reservation
        refer:
          type: string
          description: related refer
          readOnly: true
      description: Some custom fields that can be shown to the hotel or the guest
    ApiReservationPaymentDTO:
      required:
      - paymentMode
      - referenceTime
      type: object
      properties:
        refundedAmount:
          type: number
          description: The refunded amount on this payment.
          readOnly: true
        status:
          type: string
          enum:
          - NORMAL
          - WAITING_PAYSTEP
          - WAITING_AUTHENTICATION
          - WAITING_PRE_AUTH
          - ERROR_RETRY
          - EXPIRED_PRE_AUTH
          - ERROR_REFUNDABLE_FAILED
          - PAYSTEP_REFUNDABLE_KEPT
        id:
          type: integer
          description: Octorate ID of this item
          format: int64
          readOnly: true
        invoiceId:
          type: integer
          description: "The related invoice of this payment, if any"
          format: int64
        reservationRoom:
          type: integer
          description: The related reservation of this payment
          format: int64
        transaction:
          type: string
          description: The transaction id of the external partner
        creditCard:
          $ref: "#/components/schemas/ApiReservationCard"
        paymentStep:
          type: integer
          description: The source of the automatic payment (id)
          format: int64
        paymentStepTitle:
          type: string
          description: The source of the automatic payment (description)
          readOnly: true
        insertTime:
          type: string
          description: insert time of this item
          format: date-time
          readOnly: true
        referenceTime:
          type: string
          description: the payment can be inserted today but it could reference as
            'Pay date' yesterday
          format: date-time
        chargeTime:
          type: string
          description: When will (or has been) charged this item?
          format: date-time
        preauthExpiration:
          type: string
          description: "The time where the preauth will expire. If this column is\
            \ set, it means is currently a pre-authorization"
          format: date-time
        description:
          type: string
          description: Notes related to this payment
        paymentMode:
          type: string
          description: Kind of payment mode
          example: CREDITCARD
          enum:
          - UNKNOWN
          - CASH
          - CREDITCARD
          - PREPAID
          - BANKTRANSFER
          - NOTPAID
          - PAYPAL
          - CHEQUE
          - TRAVELCHEQUE
          - TREASURY_OFFICE
          - BONCADEAU
          - TREASURY_RECEIPT
          - COMMISSION
        source:
          type: string
          description: The executor of this payment
          enum:
          - PRIVATE
          - AGENCY
        amount:
          type: number
          description: Amount of this payment
        cityTaxAmount:
          type: number
          description: "If this part is reserved to city tax, what part of amount\
            \ is regarding city tax?"
        user:
          $ref: "#/components/schemas/ApiUserRef"
        scheduledTime:
          type: string
          description: Scheduled time of this payment. If filled and amount is zero
            is not yet paid
          format: date-time
        scheduledAmount:
          type: number
          description: Scheduled amount of this payment. If filled and amount is zero
            is not yet paid
        scheduledError:
          type: string
          description: Last scheduled error
          readOnly: true
        type:
          type: string
          description: The type of payment
          enum:
          - NONE
          - DEPOSIT
          - PAYOFF
        paypalResponsePresent:
          type: boolean
          description: Is the PayPal response present?
          readOnly: true
        expired:
          type: boolean
          description: Is this payment expired? Means that we were not able to process
            this payment in reasonable time
          readOnly: true
        waiting:
          type: boolean
          description: Is this payment waiting? A typical case of that kind of payment
            is when the bank asks for authentication (the sms from the bank)
          readOnly: true
        scheduled:
          type: boolean
          description: if true this payment is or was scheduled.
          readOnly: true
          example: false
        authenticated:
          type: boolean
          description: if true this payment is authenticated.
          readOnly: true
          example: false
        refundable:
          type: boolean
          description: This payment is considered to be refundable. This information
            is deducted and readonly
          readOnly: true
        scheduledRetry:
          type: integer
          description: "Allowed attemps, you can set a value != 0 to retry this payment.\
            \ Normally is used for automatic takings"
          format: int32
        authenticatePaymentParam:
          type: string
          description: "An encrypted parameter useful for executing payment actions,\
            \ such as generating a reminder link for the guest's payment"
          readOnly: true
        refundRetry:
          type: integer
          description: "Allowed attemps, you can set a value != 0 to retry the refund\
            \ for this payment."
          format: int32
        paymentStepRefundAfterDays:
          type: integer
          description: The source of the automatic payment (refund after days)
          format: int32
          readOnly: true
        stopCron:
          type: boolean
          description: Whether Octorate crons are allowed to process this item. Set
            TRUE to stop automatic refund of deposits.
        payoffs:
          type: array
          description: The list of payoff of the payment.
          items:
            $ref: "#/components/schemas/ApiInvoicePayoffDTO"
    ApiReservationRespDTO:
      required:
      - channelId
      - checkin
      - checkout
      - createTime
      - guests
      - product
      - refer
      - roomGross
      - totalChildren
      - totalGuest
      - totalInfants
      - updateTime
      type: object
      properties:
        status:
          type: string
          description: Status of the reservation
          example: CONFIRMED
          enum:
          - CANCELLED
          - WAITING
          - CONFIRMED
        refer:
          maximum: 25
          type: string
          description: "Unique refer of a group of reservations for your system, the\
            \ channel or octorate"
          readOnly: true
          example: A2DD123_AA2211
        guests:
          type: array
          description: Guests of the reservation
          items:
            $ref: "#/components/schemas/ApiReservationGuestDTO"
        privateNotes:
          type: string
          description: Internal Notes
          example: "Customer says is not sure whether will arrive on 25th or 26th\
            \ of March, Payment was agreed but not yet arrived"
        roomCode:
          $ref: "#/components/schemas/ApiReservationRoomCodeDTO"
        channelRefer:
          type: string
          description: The refer assigned in the external portal.
          readOnly: true
          example: A12FF232DDDDDD
        channelId:
          type: integer
          description: Octorate ID for the portal
          format: int64
          example: 212
        product:
          type: integer
          description: The product to be associated with this reservation. i.e. 'Double
            Room Not Ref.'
          format: int64
          example: 1222222
        pmsProduct:
          type: integer
          description: The PMS room assigned. i.e. the 102 of the product 'Double
            Room'
          format: int64
          example: 1200122
        checkin:
          type: string
          description: "Exact date (and time) the guest is expected to came in the\
            \ accommodation. Date is in UTC, ISO format. Check accommodation timezone\
            \ for conversion."
          format: date-time
          example: 2019-12-10T11:03:00Z
          externalDocs:
            url: https://www.iso.org/iso-8601-date-and-time-format.html
        checkout:
          type: string
          description: "Exact Date (and time) the guest  is expected to came leave\
            \ the accommodation. Date is in UTC, ISO format. Check accommodation timezone\
            \ for conversion. i.e. guests arrives on 2020-07-18 at 13.00 HST time\
            \ (UTC -10), here you will have 2020-07-18 at 23:00"
          format: date-time
          example: 2019-12-15T11:03:00Z
          externalDocs:
            url: https://www.iso.org/iso-8601-date-and-time-format.html
        effectiveCheckin:
          type: string
          description: "Exact date (and time) the guest has been presented to the\
            \ receptionist for document related checkin. Date is in UTC, ISO format.\
            \ Check accommodation timezone for conversion."
          format: date-time
          example: 2019-12-10T11:03:00Z
          externalDocs:
            url: https://www.iso.org/iso-8601-date-and-time-format.html
        effectiveCheckout:
          type: string
          description: "Exact date (and time) the guest has leaved the accommodation\
            \ and has given back the keys. Date is in UTC, ISO format. Check accommodation\
            \ timezone for conversion."
          format: date-time
          example: 2019-12-10T11:03:00Z
          externalDocs:
            url: https://www.iso.org/iso-8601-date-and-time-format.html
        createTime:
          type: string
          description: "Exact Date (and time) when the reservation was created. Date\
            \ is in UTC, ISO format. No related to the accommodation take as it is"
          format: date-time
          example: 2019-12-09T11:03:00Z
          externalDocs:
            url: https://www.iso.org/iso-8601-date-and-time-format.html
        updateTime:
          type: string
          description: "Last date and time the reservation was updated. Date is in\
            \ UTC, ISO format. No related to the accommodation take as it is"
          format: date-time
          example: 2019-12-17T11:03:00Z
          externalDocs:
            url: https://www.iso.org/iso-8601-date-and-time-format.html
        roomGross:
          type: number
          description: Price gross of the room only. USE THIS AND SET NULL GROSS PRICE
            IF YOU HANDLE EXTRAS SEPARATELY.
          example: 47.56
        totalGuest:
          type: integer
          description: Total guests of the reservation
          format: int32
          default: 0
        totalChildren:
          type: integer
          description: Total children of the reservation
          format: int32
          default: 0
        totalInfants:
          type: integer
          description: Total infants of the reservation
          format: int32
          default: 0
        channelNotes:
          type: string
          description: Notes from the portal
          example: Reservation payment facilitated through a virtual card
        metaData:
          type: array
          description: Some custom fields that can be shown to the hotel or the guest
          items:
            $ref: "#/components/schemas/ApiReservationMetadataDTO"
        grouped:
          type: boolean
          description: "If this result describe a single room reservation, or the\
            \ group of reservations (sharing the same refer like when they book a\
            \ double and a triple room)"
          readOnly: true
        priceBreakdown:
          type: array
          description: "Combined list of all the elements creating the price breakdown,\
            \ @see ApiComponentType for a list of values. Actually we support only\
            \ extras adding/updating, other fields are readonly"
          readOnly: true
          items:
            $ref: "#/components/schemas/ApiReservationComponent"
        id:
          type: integer
          description: Unique id identifying this reservation for Octorate (to an
            id)
          format: int64
          readOnly: true
          example: 123123
        channelName:
          type: string
          description: Human friendly rappresentation of the portal
          readOnly: true
          example: BOOKING
        currency:
          type: object
          properties:
            currencyCode:
              type: string
            numericCode:
              type: integer
              format: int32
            numericCodeAsString:
              type: string
            displayName:
              type: string
            symbol:
              type: string
            defaultFractionDigits:
              type: integer
              format: int32
          description: ISO Currencies
          readOnly: true
          example: EUR
          externalDocs:
            url: https://www.currency-iso.org/en/home/tables/table-a1.html
        touristTax:
          type: number
          description: 'Price of the city tax. This value is CALCULATED on time. '
          readOnly: true
          example: 12.0
        paymentType:
          type: string
          description: The suggested payment mode to the customer for this reservation.
            It can be different regarding each payment
          readOnly: true
          example: CREDITCARD
          enum:
          - UNKNOWN
          - CASH
          - CREDITCARD
          - PREPAID
          - BANKTRANSFER
          - NOTPAID
          - PAYPAL
          - CHEQUE
          - TRAVELCHEQUE
          - TREASURY_OFFICE
          - BONCADEAU
          - TREASURY_RECEIPT
          - COMMISSION
        paymentStatus:
          type: string
          description: Payment status of this reservation.
          readOnly: true
          example: UNPAID
          enum:
          - UNPAID
          - PARTIALLY_PAID
          - PAID_DEPOSIT
          - PAID
        freeCancellation:
          type: boolean
          description: "Describe, if according to the room this reservation in cancellable\
            \ or nor"
          readOnly: true
        paidCancellation:
          type: string
          description: Describe according to the property or room settings when the
            cancellation fee will be paid
          format: date-time
          readOnly: true
        creditCard:
          $ref: "#/components/schemas/ApiReservationCard"
        payments:
          type: array
          description: List of payments inside the reservation
          readOnly: true
          items:
            $ref: "#/components/schemas/ApiReservationPaymentDTO"
        linkedReservations:
          type: array
          description: Reservations that are linked by the same refer
          readOnly: true
          items:
            type: integer
            description: Reservations that are linked by the same refer
            format: int64
            readOnly: true
        accommodation:
          $ref: "#/components/schemas/ApiAccommodationLight"
        splitOriginal:
          $ref: "#/components/schemas/ApiReservationSplit"
        rooms:
          type: integer
          description: number of rooms rappresented by this response. Note! This will
            be severall rooms only if group by refer is active
          format: int32
        roomName:
          type: string
          description: Room name
          readOnly: true
        roomNameGuest:
          type: string
          description: Room name in guest languange
          readOnly: true
        guestsList:
          type: string
          description: comma separated guest list
          readOnly: true
        guestMailAddress:
          type: string
          description: Guest mail address
          readOnly: true
        arrivalTime:
          type: string
          description: The time the guests came in the accommodation
          readOnly: true
        groupId:
          type: integer
          description: Group Identifier
          format: int64
          readOnly: true
          externalDocs:
            url: https://community.octorate.com/post/group-reservation-619bbc9ed5ca1047d3abb665
        itemCompleted:
          type: boolean
          description: If this item has been marked as completed by the property
          readOnly: true
        noShow:
          type: boolean
          description: "If this flag is true, the customer did not show up at the\
            \ property"
          readOnly: true
        ratePlan:
          type: integer
          description: "If the rateplan are set, this is the rate plan id of this\
            \ reservation. Mainly is used for Booking Engine"
          format: int64
          readOnly: true
        ratePlanPrice:
          type: number
          description: "If the rateplan are set, this is the rate plan price correction"
        paymentExpiration:
          type: string
          description: "If any, this is the payment expiration for this reservation"
          format: date-time
          readOnly: true
        cancelledBy:
          type: string
          description: Say if the reservation has been cancelled by guest or accommodation
          readOnly: true
          enum:
          - guest
          - accommodation
        cancelledTime:
          type: string
          description: "In which time the reservation has been cancelled ? In case\
            \ of booking engine this date is exact, in case of ota is approximated\
            \ to the last cancel time"
          format: date-time
        totalPaid:
          type: number
          description: How much has been already paid for this reservation
          readOnly: true
        tagColor:
          type: integer
          description: Rapresent the tag color of this resource
          format: int64
        googleHpa:
          type: string
          description: "The google HPA code.  \"Hotel Prices Application\" (HPA) which\
            \ is part of Google Hotel Ads. Google Hotel Ads display your hotel availability\
            \ and rates on Google Search, Maps, and the Assistant."
        autoLoginParam:
          type: string
          description: Encoded auto login param
          readOnly: true
        otaId:
          type: integer
          description: OTA id if this reservation is from an OTA
          format: int64
          readOnly: true
        statusDisagree:
          type: boolean
          description: "If this reservation is a group and has been grouped by refer,\
            \ specify if the status inside disagree"
        threadId:
          type: integer
          description: Thread id of this reservation (if exists)
          format: int64
        housekeepingNotes:
          type: string
          description: The housekeeping notes
        noteTime:
          type: boolean
          description: TRUE to add time and user info to internal notes
        externalMappingReference:
          type: string
          description: External reference of this reservation. Usually is the ROOM:RATEPLAN
          readOnly: true
        split:
          $ref: "#/components/schemas/ApiReservationSplit"
        guest:
          $ref: "#/components/schemas/ReservationStreamGuest"
        externalRefer:
          type: string
        reservationExternal:
          $ref: "#/components/schemas/ReservationExternal"
        api:
          type: boolean
        zip:
          type: string
        cleaningFee:
          type: number
        place:
          $ref: "#/components/schemas/Place"
        city:
          type: string
        address:
          type: string
        country:
          type: string
        cityTaxExemption:
          type: string
          enum:
          - TOO_YOUNG_RANGE2
          - HOSPITALISED
          - POLICE
          - DRIVER
          - TURIST_GUIDE
          - LONG_STAY
          - STUDY_RELATED
          - FESTIVALS
          - OTHER
          - HANDICAPPED
          - RESIDENCE_REASON
          - LOW_SEASON
          - EMERGENCY
          - HOSPITAL_HELPER
          - TOO_OLD
          - DISABLED_HELPER
          - HOTEL_WORKERS
          - EXEMPTION_WORKERS
          - FREQUENT_GUEST
          - WANT_NOT_PAY
          - PORTAL_PAID
          - TOO_YOUNG_RANGE1
          - WORK_STAY
          - SPIRITUAL_RETREAT
          - PET_CARE
          - INTERNATIONAL_PROTECTION
          - SEPARATED_PARENT
          - FAMILY_CAREGIVER
          - GENDER_VIOLENCE
          - PATIENT_PARENT
        cityTaxPrice:
          type: number
        draft:
          type: boolean
        validated:
          type: boolean
        validatedDate:
          type: string
          format: date-time
        internalId:
          type: integer
          format: int64
        externalId:
          type: string
        systemGenerated:
          type: boolean
        taxIncluded:
          type: boolean
        notRefundable:
          type: boolean
        loyaltyDiscount:
          type: boolean
        externalDiscountId:
          type: string
        extraIncluded:
          type: array
          items:
            $ref: "#/components/schemas/ReservationStreamExtra"
        internalRate:
          type: integer
          format: int64
        cityTaxAmountInPayment:
          type: number
        companyCollect:
          type: string
          enum:
          - NONE
          - COMPANY
          - HOTEl
        daily:
          type: array
          items:
            $ref: "#/components/schemas/ReservationStreamDay"
        json:
          type: object
          additionalProperties:
            type: object
        streamFromAccommodation:
          type: boolean
        related:
          type: array
          items:
            $ref: "#/components/schemas/ReservationStream"
        streamCard:
          $ref: "#/components/schemas/ReservationStreamCard"
        cityTaxZero:
          type: boolean
        propertyReference:
          type: string
        octorateId:
          type: integer
          format: int64
        pushImportId:
          type: integer
          format: int64
        cancelPenality:
          type: number
        paymentMode:
          type: string
          enum:
          - UNKNOWN
          - CASH
          - CREDITCARD
          - PREPAID
          - BANKTRANSFER
          - NOTPAID
          - PAYPAL
          - CHEQUE
          - TRAVELCHEQUE
          - TREASURY_OFFICE
          - BONCADEAU
          - TREASURY_RECEIPT
          - COMMISSION
        connectionId:
          type: integer
          format: int64
        count:
          type: integer
          format: int32
        extra:
          type: array
          items:
            $ref: "#/components/schemas/ReservationStreamExtra"
        groupName:
          type: string
        ratePlanId:
          type: integer
          format: int64
        ratePlanVariation:
          type: number
        houseKeepingNotes:
          type: string
        tagLabel:
          type: integer
          format: int64
        agencyId:
          type: integer
          format: int64
        invoiceHolderId:
          type: integer
          format: int64
        purpose:
          type: string
          enum:
          - "0"
          - "1"
          - "2"
          - "3"
          - "4"
          - "5"
        roomLocked:
          type: boolean
        checkinClerk:
          type: integer
          format: int64
        checkoutClerk:
          type: integer
          format: int64
        housekeeperClerk:
          type: integer
          format: int64
        deposit:
          type: number
        technicalCreditCardChange:
          type: boolean
        reservationSplitStream:
          $ref: "#/components/schemas/ReservationSplitStream"
        groupNotes:
          type: string
        flight:
          type: string
        policeGuests:
          type: array
          items:
            $ref: "#/components/schemas/ReservationStreamPoliceGuest"
        color:
          type: string
        completed:
          type: boolean
      readOnly: true
    ApiReservationRoomCodeDTO:
      type: object
      properties:
        pmsProduct:
          type: integer
          description: The PMS product (It means the real room where this code is
            valid)
          format: int64
          readOnly: true
          example: 1239887
        reservation:
          type: integer
          description: The ID of the reservation (It means this code is valid only
            for this reservation ID)
          format: int64
          readOnly: true
          example: 12365487
        code:
          type: string
          description: Code to use to open the door
          example: "2549"
        rfcTagId:
          type: string
          description: RFC Tag ID
          example: A-1234324-BBB
        locked:
          type: boolean
          description: "If we have (otherwise is null), this is an information regarding\
            \ if the door is locked or not"
          example: true
        source:
          type: string
          description: "Source of the generated code: Octorate in case of room assign\
            \ will generate a new code, in case you are assign codes and not using\
            \ ours, you can consider 'code' field as null if source is WebConcierge"
          readOnly: true
          example: WEBCONCIERGE
          enum:
          - OTHER
          - USER
          - PORTAL
          - WEBCHECKIN
          - APP
          - API
          - SYSTEM
      description: Object that describe the code assigned to the room
    ApiReservationSplit:
      type: object
      properties:
        splitRoom:
          $ref: "#/components/schemas/ApiObjectLight"
        splitAccommodation:
          $ref: "#/components/schemas/ApiAccommodationLight"
        connection:
          $ref: "#/components/schemas/ApiObjectLight"
        splitStart:
          type: string
          description: Split starting date. Date in ISO FORMAT. This will end in the
            next split date or the end of the reservation.
          format: date
      description: "Split of this reservation. The object contained here contains\
        \ the original reference of this reservation (i.e. portal id, room and accommodation)Applied\
        \ When some PM choose to move the reservation. <br/>Keep care! Moving the\
        \ reservation on another room will affect only the visualization. <br/>All\
        \ the Octorate process will stay on the original accommodation/room (i.e.\
        \ police send, voucher, invoicing, etc...)"
    ApiUserRef:
      type: object
      properties:
        id:
          type: integer
          format: int64
        username:
          type: string
        firstname:
          type: string
        lastname:
          type: string
        codpromo:
          type: string
        type:
          type: string
          enum:
          - USER
          - ADMIN
          - AFFILIATE
      description: User performing this operation
      readOnly: true
    ChatThreadAttributeDTO:
      required:
      - threadId
      - value
      type: object
      properties:
        id:
          type: integer
          description: Reference inside our system
          format: int64
          example: 17
        threadId:
          type: integer
          description: The thread linked to this attribute
          format: int64
          example: 17
        type:
          type: string
          description: The type of this attribute
          example: AIRBNB_BOOKING_DETAILS
          enum:
          - AIRBNB_BOOKING_DETAILS
          - TEST_BOOKING_DETAILS
          - AI_ASSISTANCE_THREAD
        value:
          type: string
          description: The value of this attribute
          example: Hello world!
      description: Attributes of this chat thread
      example:
      - id: 65
        messageId: 61
        type: AIRBNB_BOOKING_DETAILS
        value: Hello world!
    ChatThreadDTO:
      required:
      - defaultProcessor
      - persons
      type: object
      properties:
        id:
          type: integer
          description: Reference inside our system
          format: int64
          example: 17
        accommodationId:
          type: string
          description: The accommodation owning this thread
          example: "17"
        defaultProcessor:
          type: string
          description: The default processor of this chat thread
          example: DIRECT
          enum:
          - DIRECT
          - WHATSAPP
          - CHANNEL
          - WHATSAPP_MANUAL
          - MAIL
          - NOTE
        persons:
          uniqueItems: true
          type: array
          description: The members of this thread
          example:
          - email: mario.rossi@octorate.com
            firstname: Mario
            fullname: Rossi Mario
            id: 17
            lastname: Rossi
            userId: 12345
            username: mario_rossi
          items:
            $ref: "#/components/schemas/PersonDTO"
        lastMessage:
          $ref: "#/components/schemas/ChatMessageDTO"
        chatThreadExternals:
          type: array
          description: The threads external linked to this thread
          example:
          - id: 17
            threadId: 17
            connectionId: 123458
            externalId: 0000e7ae-b79b-11ec-a2b5-199d8f8d3242
          items:
            $ref: "#/components/schemas/ChatThreadExternalDTO"
        attributes:
          uniqueItems: true
          type: array
          description: Attributes of this chat thread
          example:
          - id: 65
            messageId: 61
            type: AIRBNB_BOOKING_DETAILS
            value: Hello world!
          items:
            $ref: "#/components/schemas/ChatThreadAttributeDTO"
        reservation:
          $ref: "#/components/schemas/ApiReservationRespDTO"
        archiveTime:
          type: string
          description: The archive time of this thread
          format: date-time
          example: 2022-12-06T12:54:15.636Z
        aiDriven:
          type: boolean
          description: Is this thread driven by the AI?
    ChatThreadExternalDTO:
      required:
      - threadId
      type: object
      properties:
        id:
          type: integer
          description: Reference inside our system
          format: int64
          example: 17
        threadId:
          type: integer
          description: The chat thread linked to this chat thread external
          format: int64
          example: 17
        connectionId:
          type: integer
          description: Internal id of the connection with the portal
          format: int64
          example: 123458
        externalId:
          type: string
          description: External id of this thread external
          example: 0000e7ae-b79b-11ec-a2b5-199d8f8d3242
      description: The threads external linked to this thread
      example:
      - id: 17
        threadId: 17
        connectionId: 123458
        externalId: 0000e7ae-b79b-11ec-a2b5-199d8f8d3242
    ReservationExternal:
      type: object
      properties:
        id:
          type: integer
          format: int64
        channelId:
          type: string
        propertyId:
          type: string
        octorateId:
          type: string
        room:
          type: string
    ReservationSplitStream:
      type: object
      properties:
        id:
          type: integer
          format: int64
        codice:
          type: string
        splitDate:
          type: string
          format: date-time
        splitRoomId:
          type: integer
          format: int64
    ReservationStream:
      type: object
      properties:
        groupName:
          type: string
        portalId:
          type: string
        internalRoom:
          type: integer
          format: int64
        pax:
          type: integer
          format: int32
        startDate:
          type: string
          format: date-time
        endDate:
          type: string
          format: date-time
        total:
          type: number
        roomGross:
          type: number
        refer:
          type: string
        externalRoom:
          type: string
        guest:
          $ref: "#/components/schemas/ReservationStreamGuest"
        taxIncluded:
          type: boolean
        ratePlanId:
          type: integer
          format: int64
        externalRefer:
          type: string
        effectiveCheckin:
          type: string
          format: date-time
        effectiveCheckout:
          type: string
          format: date-time
        infants:
          type: integer
          format: int32
        specialRequests:
          type: string
        reservationExternal:
          $ref: "#/components/schemas/ReservationExternal"
        notRefundable:
          type: boolean
        paymentExpiration:
          type: string
          format: date-time
        api:
          type: boolean
        loyaltyDiscount:
          type: boolean
        externalDiscountId:
          type: string
        extraIncluded:
          type: array
          items:
            $ref: "#/components/schemas/ReservationStreamExtra"
        ratePlanVariation:
          type: number
        internalRate:
          type: integer
          format: int64
        portalNotes:
          type: string
        houseKeepingNotes:
          type: string
        tagLabel:
          type: integer
          format: int64
        agencyId:
          type: integer
          format: int64
        invoiceHolderId:
          type: integer
          format: int64
        noteTime:
          type: boolean
        purpose:
          type: string
          enum:
          - "0"
          - "1"
          - "2"
          - "3"
          - "4"
          - "5"
        paidStayTax:
          type: number
        totalPaid:
          type: number
        cityTaxAmountInPayment:
          type: number
        roomLocked:
          type: boolean
        totalCommissions:
          type: number
        companyCollect:
          type: string
          enum:
          - NONE
          - COMPANY
          - HOTEl
        daily:
          type: array
          items:
            $ref: "#/components/schemas/ReservationStreamDay"
        paidNotes:
          type: string
        checkinClerk:
          type: integer
          format: int64
        checkoutClerk:
          type: integer
          format: int64
        housekeeperClerk:
          type: integer
          format: int64
        pmsRoom:
          type: string
        deposit:
          type: number
        json:
          type: object
          additionalProperties:
            type: object
        streamFromAccommodation:
          type: boolean
        updateDate:
          type: string
          format: date-time
        createDate:
          type: string
          format: date-time
        technicalCreditCardChange:
          type: boolean
        streamCard:
          $ref: "#/components/schemas/ReservationStreamCard"
        reservationSplitStream:
          $ref: "#/components/schemas/ReservationSplitStream"
        groupNotes:
          type: string
        flight:
          type: string
        conversationId:
          type: string
        cityTaxZero:
          type: boolean
        propertyReference:
          type: string
        policeGuests:
          type: array
          items:
            $ref: "#/components/schemas/ReservationStreamPoliceGuest"
        cleaningFee:
          type: number
        octorateId:
          type: integer
          format: int64
        place:
          $ref: "#/components/schemas/Place"
        pushImportId:
          type: integer
          format: int64
        cancelPenality:
          type: number
        color:
          type: string
        paymentMode:
          type: string
          enum:
          - UNKNOWN
          - CASH
          - CREDITCARD
          - PREPAID
          - BANKTRANSFER
          - NOTPAID
          - PAYPAL
          - CHEQUE
          - TRAVELCHEQUE
          - TREASURY_OFFICE
          - BONCADEAU
          - TREASURY_RECEIPT
          - COMMISSION
        lang:
          type: string
          enum:
          - IT
          - EN
          - FR
          - ES
          - DE
          - RU
          - PT
          - NL
          - JA
          - EL
          - TR
          - ZH
          - CA
          - RO
        connectionId:
          type: integer
          format: int64
        groupId:
          type: integer
          format: int64
        count:
          type: integer
          format: int32
        currency:
          type: object
          properties:
            currencyCode:
              type: string
            numericCode:
              type: integer
              format: int32
            numericCodeAsString:
              type: string
            displayName:
              type: string
            symbol:
              type: string
            defaultFractionDigits:
              type: integer
              format: int32
        extra:
          type: array
          items:
            $ref: "#/components/schemas/ReservationStreamExtra"
        children:
          type: integer
          format: int32
        completed:
          type: boolean
        status:
          type: string
          enum:
          - CANCELLED
          - WAITING
          - CONFIRMED
    ReservationStreamCard:
      type: object
      properties:
        activationDate:
          type: string
          format: date-time
        expirationDate:
          type: string
          format: date-time
        currentBalance:
          type: number
        isVirtual:
          type: boolean
        token:
          type: string
        pan:
          type: string
        cvv:
          type: string
        cardHolder:
          type: string
        cardType:
          type: string
        virtual:
          type: boolean
        empty:
          type: boolean
    ReservationStreamDay:
      type: object
      properties:
        day:
          type: string
          format: date-time
        price:
          type: number
        priceDiscount:
          type: number
        taxIncluded:
          type: boolean
        ratePlanCorrection:
          type: number
    ReservationStreamExtra:
      type: object
      properties:
        price:
          type: number
        quantity:
          type: integer
          format: int32
        manual:
          type: boolean
        octorateProductId:
          type: integer
          format: int64
        octorateExtraId:
          type: integer
          format: int64
        productionDate:
          type: string
          format: date-time
        group:
          type: boolean
        reference:
          type: string
        day:
          type: string
          format: date-time
    ReservationStreamGuest:
      type: object
      properties:
        cityTaxExemption:
          type: string
          enum:
          - TOO_YOUNG_RANGE2
          - HOSPITALISED
          - POLICE
          - DRIVER
          - TURIST_GUIDE
          - LONG_STAY
          - STUDY_RELATED
          - FESTIVALS
          - OTHER
          - HANDICAPPED
          - RESIDENCE_REASON
          - LOW_SEASON
          - EMERGENCY
          - HOSPITAL_HELPER
          - TOO_OLD
          - DISABLED_HELPER
          - HOTEL_WORKERS
          - EXEMPTION_WORKERS
          - FREQUENT_GUEST
          - WANT_NOT_PAY
          - PORTAL_PAID
          - TOO_YOUNG_RANGE1
          - WORK_STAY
          - SPIRITUAL_RETREAT
          - PET_CARE
          - INTERNATIONAL_PROTECTION
          - SEPARATED_PARENT
          - FAMILY_CAREGIVER
          - GENDER_VIOLENCE
          - PATIENT_PARENT
        zip:
          type: string
        cityTaxPrice:
          type: number
        draft:
          type: boolean
        validated:
          type: boolean
        validatedDate:
          type: string
          format: date-time
        internalId:
          type: integer
          format: int64
        externalId:
          type: string
        phone:
          type: string
        firstName:
          type: string
        lastName:
          type: string
        city:
          type: string
        email:
          type: string
        systemGenerated:
          type: boolean
        address:
          type: string
        country:
          type: string
    ReservationStreamPoliceGuest:
      type: object
      properties:
        ageRange:
          type: string
          enum:
          - ADULT
          - CHILD
          - BABY
        cityTaxExemption:
          type: string
          enum:
          - TOO_YOUNG_RANGE2
          - HOSPITALISED
          - POLICE
          - DRIVER
          - TURIST_GUIDE
          - LONG_STAY
          - STUDY_RELATED
          - FESTIVALS
          - OTHER
          - HANDICAPPED
          - RESIDENCE_REASON
          - LOW_SEASON
          - EMERGENCY
          - HOSPITAL_HELPER
          - TOO_OLD
          - DISABLED_HELPER
          - HOTEL_WORKERS
          - EXEMPTION_WORKERS
          - FREQUENT_GUEST
          - WANT_NOT_PAY
          - PORTAL_PAID
          - TOO_YOUNG_RANGE1
          - WORK_STAY
          - SPIRITUAL_RETREAT
          - PET_CARE
          - INTERNATIONAL_PROTECTION
          - SEPARATED_PARENT
          - FAMILY_CAREGIVER
          - GENDER_VIOLENCE
          - PATIENT_PARENT
        cityTaxRelativeToGroup:
          type: boolean
        cityTaxPrice:
          type: number
        mainGuest:
          type: boolean
        accommodatedType:
          type: string
          enum:
          - SINGLE_GUEST
          - HEAD_OF_FAMILY
          - HEAD_OF_GROUP
          - RELATIVE
          - MEMBER_GROUP
        checkout:
          type: string
          format: date
        checkin:
          type: string
          format: date
        age:
          type: integer
          format: int32
        zip:
          type: string
        draft:
          type: boolean
        validated:
          type: boolean
        validatedDate:
          type: string
          format: date-time
        internalId:
          type: integer
          format: int64
        externalId:
          type: string
        phone:
          type: string
        firstName:
          type: string
        lastName:
          type: string
        city:
          type: string
        email:
          type: string
        systemGenerated:
          type: boolean
        address:
          type: string
        country:
          type: string
    MailTemplateDTO:
      type: object
      properties:
        id:
          type: integer
          description: Reference inside our system
          format: int64
          example: 17
        name:
          type: string
          description: The name of this template
          example: Conferma prenotazione
        language:
          type: string
          description: The language of this template
          example: IT
          enum:
          - IT
          - EN
          - FR
          - ES
          - DE
          - RU
          - PT
          - NL
          - JA
          - EL
          - TR
          - ZH
          - CA
          - RO
        text:
          type: string
          description: The body of this template
          example: Hello world!
    ContentCodeMapping:
      type: object
      properties:
        id:
          type: integer
          format: int64
          readOnly: true
        imported:
          type: boolean
          readOnly: true
        portal:
          type: string
          readOnly: true
          example: AIRBNB
          enum:
          - "booking_xml, airbnb_xml, homeaway"
        country:
          type: string
          enum:
          - AF
          - AX
          - AL
          - DZ
          - AS
          - AD
          - AO
          - AI
          - AQ
          - AG
          - AR
          - AM
          - AW
          - AU
          - AT
          - AZ
          - BS
          - BH
          - BD
          - BB
          - BY
          - BE
          - BZ
          - BJ
          - BM
          - BT
          - BO
          - BQ
          - BA
          - BW
          - BV
          - BR
          - IO
          - BN
          - BG
          - BF
          - BI
          - KH
          - CM
          - CA
          - CV
          - KY
          - CF
          - TD
          - CL
          - CN
          - CX
          - CC
          - CO
          - KM
          - CG
          - CD
          - CK
          - CR
          - CI
          - HR
          - CU
          - CW
          - CY
          - CZ
          - DK
          - DJ
          - DM
          - DO
          - EC
          - EG
          - SV
          - GQ
          - ER
          - EE
          - ET
          - FK
          - FO
          - FJ
          - FI
          - FR
          - GF
          - PF
          - TF
          - GA
          - GM
          - GE
          - DE
          - GH
          - GI
          - GR
          - GL
          - GD
          - GP
          - GU
          - GT
          - GG
          - GN
          - GW
          - GY
          - HT
          - HM
          - VA
          - HN
          - HK
          - HU
          - IS
          - IN
          - ID
          - IR
          - IQ
          - IE
          - IM
          - IL
          - IT
          - JM
          - JP
          - JE
          - JO
          - KZ
          - KE
          - KI
          - KP
          - KR
          - KW
          - KG
          - LA
          - LV
          - LB
          - LS
          - LR
          - LY
          - LI
          - LT
          - LU
          - MO
          - MK
          - MG
          - MW
          - MY
          - MV
          - ML
          - MT
          - MH
          - MQ
          - MR
          - MU
          - YT
          - MX
          - FM
          - MD
          - MC
          - MN
          - ME
          - MS
          - MA
          - MZ
          - MM
          - NA
          - NR
          - NP
          - NL
          - NC
          - NZ
          - NI
          - NE
          - NG
          - NU
          - NF
          - MP
          - "NO"
          - OM
          - PK
          - PW
          - PS
          - PA
          - PG
          - PY
          - PE
          - PH
          - PN
          - PL
          - PT
          - PR
          - QA
          - RE
          - RO
          - RU
          - RW
          - BL
          - SH
          - KN
          - LC
          - MF
          - PM
          - VC
          - WS
          - SM
          - ST
          - SA
          - SN
          - RS
          - SC
          - SL
          - SG
          - SX
          - SK
          - SI
          - SB
          - SO
          - ZA
          - GS
          - SS
          - ES
          - LK
          - SD
          - SR
          - SJ
          - SZ
          - SE
          - CH
          - SY
          - TW
          - TJ
          - TZ
          - TH
          - TL
          - TG
          - TK
          - TO
          - TT
          - TN
          - TR
          - TM
          - TC
          - TV
          - UG
          - UA
          - AE
          - GB
          - US
          - UM
          - UY
          - UZ
          - VU
          - VE
          - VN
          - VG
          - VI
          - WF
          - EH
          - YE
          - ZM
          - ZW
          - XJ
        description:
          type: object
          properties:
            emptyValues:
              type: boolean
            empty:
              type: boolean
          additionalProperties:
            type: string
            readOnly: true
            example: "{\"EN\":\"These are the LanguageMap value in English!\"}"
            default: "{\"EN\":\"These are the access rule in English!\"}"
          readOnly: true
          example:
            EN: These are the LanguageMap value in English!
          default:
            EN: These are the access rule in English!
        title:
          type: object
          properties:
            emptyValues:
              type: boolean
            empty:
              type: boolean
          additionalProperties:
            type: string
            readOnly: true
            example: "{\"EN\":\"These are the LanguageMap value in English!\"}"
            default: "{\"EN\":\"These are the access rule in English!\"}"
          readOnly: true
          example:
            EN: These are the LanguageMap value in English!
          default:
            EN: These are the access rule in English!
        json:
          type: string
        type:
          type: string
          description: The main category of this item
          readOnly: true
          enum:
          - FEE_PERSONAL
          - CHARGE_TYPE
          - IMAGE_TAGS
          - SERVICE
          - PAYMENTS_CARD
          - LANGUAGES
          - BREAKFAST
          - CANCEL_POLICY
          - ROOM_AMENITY
          - INTERNET_CONNECTION_TYPES
          - INTERNET_CONNECTION_COVERAGE
          - PARKING_TYPE
          - BED_TYPE
          - CONTACT_TYPE
          - CONTACT_LANGUAGE
          - EXTRABED_GUEST_TYPE
          - BOOKING_ACCEPTED_GUESTS
          - FEE_TAX
          - RATE_OFFER
          - PRODUCT_BENEFIT
          - ACCOMMODATION_CATEGORY
          - CITY_TAX_CATEGORY
          - CITY_TAX_NATURE
          - CANCEL_POLICY_DEPOSIT
          - ROOM_CATEGORY
          - ROOM_CLASS
          - BEDROOM_TYPE
          - ROOM_NAMING
          - PHOTO_TYPE
          - LISTING_EXPECTATION
          - PROPERTY_CHECKIN_METHOD
          - BATHROOM_LOCATION
        subType:
          type: string
          description: Used to understand whether for instance an amenities can used
            as another field.
          readOnly: true
          enum:
          - AMENITY_VIEW
          - AMENITY_KITCHEN
          - AMENITY_SHOWER_RELATED
          - AMENITY_BED_RELATED
          - AMENITY_ACCESSIBILITY
          - AMENITY_CONNECTION
        portalAttributes:
          type: string
          description: Some additional settings provided for the portal
          readOnly: true
        portalValue:
          type: string
          readOnly: true
        lastEdit:
          type: string
          format: date-time
          readOnly: true
        octorateValue:
          type: string
          readOnly: true
        ignoreMapping:
          type: boolean
        score:
          type: integer
          format: int32
        validationSchema:
          $ref: "#/components/schemas/ContentCodeValidation"
        englishDescription:
          type: string
          writeOnly: true
        convertedOctorate:
          $ref: "#/components/schemas/EnumContent"
        portalBooking:
          type: boolean
        convertible:
          type: boolean
        schema:
          $ref: "#/components/schemas/ContentMappingSchema"
        serializedName:
          type: string
      readOnly: true
    ContentCodeValidation:
      type: object
      properties:
        requiredParkingInfo:
          type: boolean
        requiredInternetInfo:
          type: boolean
    ContentMappingSchema:
      type: object
      properties:
        percent:
          type: boolean
    EnumContent:
      type: object
      properties:
        typeContent:
          type: string
          enum:
          - FEE_PERSONAL
          - CHARGE_TYPE
          - IMAGE_TAGS
          - SERVICE
          - PAYMENTS_CARD
          - LANGUAGES
          - BREAKFAST
          - CANCEL_POLICY
          - ROOM_AMENITY
          - INTERNET_CONNECTION_TYPES
          - INTERNET_CONNECTION_COVERAGE
          - PARKING_TYPE
          - BED_TYPE
          - CONTACT_TYPE
          - CONTACT_LANGUAGE
          - EXTRABED_GUEST_TYPE
          - BOOKING_ACCEPTED_GUESTS
          - FEE_TAX
          - RATE_OFFER
          - PRODUCT_BENEFIT
          - ACCOMMODATION_CATEGORY
          - CITY_TAX_CATEGORY
          - CITY_TAX_NATURE
          - CANCEL_POLICY_DEPOSIT
          - ROOM_CATEGORY
          - ROOM_CLASS
          - BEDROOM_TYPE
          - ROOM_NAMING
          - PHOTO_TYPE
          - LISTING_EXPECTATION
          - PROPERTY_CHECKIN_METHOD
          - BATHROOM_LOCATION
    ExternalAccommodationExtraBed:
      type: object
      properties:
        portal:
          $ref: "#/components/schemas/PortalNames"
        applyGuestRange:
          type: integer
          format: int32
        type:
          type: string
        price:
          type: number
        quantity:
          type: integer
          format: int32
        portalValue:
          type: string
        codeType:
          type: string
          readOnly: true
          enum:
          - FEE_PERSONAL
          - CHARGE_TYPE
          - IMAGE_TAGS
          - SERVICE
          - PAYMENTS_CARD
          - LANGUAGES
          - BREAKFAST
          - CANCEL_POLICY
          - ROOM_AMENITY
          - INTERNET_CONNECTION_TYPES
          - INTERNET_CONNECTION_COVERAGE
          - PARKING_TYPE
          - BED_TYPE
          - CONTACT_TYPE
          - CONTACT_LANGUAGE
          - EXTRABED_GUEST_TYPE
          - BOOKING_ACCEPTED_GUESTS
          - FEE_TAX
          - RATE_OFFER
          - PRODUCT_BENEFIT
          - ACCOMMODATION_CATEGORY
          - CITY_TAX_CATEGORY
          - CITY_TAX_NATURE
          - CANCEL_POLICY_DEPOSIT
          - ROOM_CATEGORY
          - ROOM_CLASS
          - BEDROOM_TYPE
          - ROOM_NAMING
          - PHOTO_TYPE
          - LISTING_EXPECTATION
          - PROPERTY_CHECKIN_METHOD
          - BATHROOM_LOCATION
        children:
          type: boolean
        applyGuestBooking:
          type: string
          enum:
          - MAX_AGE_6
          - MAX_AGE_12
          - MAX_AGE_16
        deletable:
          type: boolean
        editable:
          type: boolean
        propertyCharge:
          $ref: "#/components/schemas/OctoratePropertyCharge"
      description: Rappresent an Extra bed
      readOnly: true
    ExternalAccomodation:
      type: object
      properties:
        lastUpdate:
          type: string
          format: date-time
          readOnly: true
        propertyType:
          type: string
          description: Property type
          example: APARTMENT
        permissionPublish:
          type: integer
          description: Legal Entity Id (BOOKING.com)
          format: int64
          example: 123123
        privateOperator:
          type: boolean
        roomQuantity:
          type: integer
          format: int64
        paymentMethods:
          uniqueItems: true
          type: array
          description: Payment method portal values as described in the relative meta
          example: "{\"2\",\"3\"}"
          items:
            type: string
            description: Payment method portal values as described in the relative
              meta
            example: "{\"2\",\"3\"}"
        spokenLanguages:
          uniqueItems: true
          type: array
          example: English (UK)
          items:
            type: string
            example: English (UK)
        depositPolicies:
          uniqueItems: true
          type: array
          description: Representation of the current cancellation policies for the
            deposit amount
          readOnly: true
          items:
            $ref: "#/components/schemas/ExternalCancellationPolicy"
        extraBeds:
          uniqueItems: true
          type: array
          description: Rappresent an Extra bed
          readOnly: true
          items:
            $ref: "#/components/schemas/ExternalAccommodationExtraBed"
        maxExtraBeds:
          type: integer
          format: int32
        bookingPetsPolicy:
          type: string
          enum:
          - ALLOWED
          - NOT_ALLOWED
          - PETS_BY_ARRANGEMENTS
          - ASSISTIVE_ANIMALS
        petsChargePaid:
          type: boolean
        petsDeposit:
          type: number
        petsNoRefundable:
          type: number
        email:
          type: string
        contacts:
          uniqueItems: true
          type: array
          readOnly: true
          items:
            $ref: "#/components/schemas/ExternalContact"
        rentalAgreement:
          type: string
          readOnly: true
          example: resx.octorate.com/api/rentalagreement.pdf
        chainCode:
          type: string
          readOnly: true
          example: Marriot
        damagePolicy:
          $ref: "#/components/schemas/OctorateDamagePolicy"
        quietHours:
          $ref: "#/components/schemas/OctorateQuietHours"
        frenchTaxDetails:
          $ref: "#/components/schemas/OctorateFrenchTaxDetails"
        invoiceSettings:
          $ref: "#/components/schemas/OctorateInvoiceSettings"
        externalPropertyProfile:
          $ref: "#/components/schemas/ExternalPropertyProfile"
        welcomeMessage:
          $ref: "#/components/schemas/LanguageMap"
        neighborhoodInfo:
          $ref: "#/components/schemas/LanguageMap"
        ownerInfo:
          $ref: "#/components/schemas/LanguageMap"
        familyTips:
          $ref: "#/components/schemas/LanguageMap"
        propertyCheckinMethods:
          $ref: "#/components/schemas/OctoratePropertyCheckinMethods"
    ExternalCancellationPolicy:
      required:
      - portalValue
      type: object
      properties:
        applyOnDeposit:
          type: boolean
          description: Whether apply on deposit or not
          readOnly: true
        portalValue:
          type: string
          description: Portal value that's described by the relative meta
        deadline:
          type: object
          properties:
            seconds:
              type: integer
              format: int64
            zero:
              type: boolean
            nano:
              type: integer
              format: int32
            negative:
              type: boolean
            positive:
              type: boolean
            units:
              type: array
              items:
                type: object
                properties:
                  durationEstimated:
                    type: boolean
                  duration:
                    type: object
                    properties:
                      seconds:
                        type: integer
                        format: int64
                      zero:
                        type: boolean
                      nano:
                        type: integer
                        format: int32
                      negative:
                        type: boolean
                      positive:
                        type: boolean
                  timeBased:
                    type: boolean
                  dateBased:
                    type: boolean
          description: 'The deadline in  duration format '
          readOnly: true
          example: PT96H
          externalDocs:
            description: ISO 8601 format
            url: https://www.google.com/?q=ISO_8601
        afterReservation:
          type: number
          description: Percent to apply after guest should have done the checkin
          format: double
          readOnly: true
        afterDeadline:
          type: number
          description: Percent to apply after the deadline
          format: double
          readOnly: true
        applyAfterNights:
          type: integer
          description: After how many nights is applied?
          format: int32
          readOnly: true
        externalId:
          type: string
          description: External Id assigned from the portal
        deletable:
          type: boolean
        inclusive:
          type: boolean
        codeType:
          type: string
          readOnly: true
          enum:
          - FEE_PERSONAL
          - CHARGE_TYPE
          - IMAGE_TAGS
          - SERVICE
          - PAYMENTS_CARD
          - LANGUAGES
          - BREAKFAST
          - CANCEL_POLICY
          - ROOM_AMENITY
          - INTERNET_CONNECTION_TYPES
          - INTERNET_CONNECTION_COVERAGE
          - PARKING_TYPE
          - BED_TYPE
          - CONTACT_TYPE
          - CONTACT_LANGUAGE
          - EXTRABED_GUEST_TYPE
          - BOOKING_ACCEPTED_GUESTS
          - FEE_TAX
          - RATE_OFFER
          - PRODUCT_BENEFIT
          - ACCOMMODATION_CATEGORY
          - CITY_TAX_CATEGORY
          - CITY_TAX_NATURE
          - CANCEL_POLICY_DEPOSIT
          - ROOM_CATEGORY
          - ROOM_CLASS
          - BEDROOM_TYPE
          - ROOM_NAMING
          - PHOTO_TYPE
          - LISTING_EXPECTATION
          - PROPERTY_CHECKIN_METHOD
          - BATHROOM_LOCATION
        editable:
          type: boolean
        deadlineHours:
          type: integer
          format: int64
        fakeValue:
          $ref: "#/components/schemas/ContentCodeMapping"
        propertyCharge:
          $ref: "#/components/schemas/OctoratePropertyCharge"
      description: Representation of the current cancellation policies for the deposit
        amount
      readOnly: true
    ExternalContact:
      required:
      - personName
      - type
      type: object
      properties:
        portal:
          $ref: "#/components/schemas/PortalNames"
        type:
          type: string
          description: "The type of the contact as described by the portal types.\
            \ Check manual and available metas, for more information"
          example: general
        personName:
          type: string
          description: The name of the person or the company
          example: Marco
        personFamilyName:
          type: string
          description: The last name of the person
          example: Rossi
        companyName:
          type: string
          description: Legal Name of the company
          example: Rossi & co snc
        phone:
          type: string
        male:
          type: boolean
          description: "Set as TRUE if this person is a male, as FALSE if not (or\
            \ who is in charge for this contact)"
          example: true
        mail:
          type: string
        place:
          $ref: "#/components/schemas/PlaceInterface"
        languageOcto:
          type: string
          enum:
          - IT
          - EN
          - FR
          - ES
          - DE
          - RU
          - PT
          - NL
          - JA
          - EL
          - TR
          - ZH
          - CA
          - RO
        portalValue:
          type: string
        codeType:
          type: string
          readOnly: true
          enum:
          - FEE_PERSONAL
          - CHARGE_TYPE
          - IMAGE_TAGS
          - SERVICE
          - PAYMENTS_CARD
          - LANGUAGES
          - BREAKFAST
          - CANCEL_POLICY
          - ROOM_AMENITY
          - INTERNET_CONNECTION_TYPES
          - INTERNET_CONNECTION_COVERAGE
          - PARKING_TYPE
          - BED_TYPE
          - CONTACT_TYPE
          - CONTACT_LANGUAGE
          - EXTRABED_GUEST_TYPE
          - BOOKING_ACCEPTED_GUESTS
          - FEE_TAX
          - RATE_OFFER
          - PRODUCT_BENEFIT
          - ACCOMMODATION_CATEGORY
          - CITY_TAX_CATEGORY
          - CITY_TAX_NATURE
          - CANCEL_POLICY_DEPOSIT
          - ROOM_CATEGORY
          - ROOM_CLASS
          - BEDROOM_TYPE
          - ROOM_NAMING
          - PHOTO_TYPE
          - LISTING_EXPECTATION
          - PROPERTY_CHECKIN_METHOD
          - BATHROOM_LOCATION
        contract:
          type: boolean
        deletable:
          type: boolean
        editable:
          type: boolean
        propertyCharge:
          $ref: "#/components/schemas/OctoratePropertyCharge"
    ExternalPropertyProfile:
      type: object
      properties:
        hostLocation:
          type: string
          enum:
          - onsite
          - offsite
        nameOrCompany:
          type: string
        rentingDate:
          type: string
          format: date-time
        renovatingDate:
          type: string
          format: date-time
        builtDate:
          type: string
          format: date-time
        isCompanyProfile:
          type: boolean
        photoUri:
          type: string
      description: External Property Profile
    OctorateAmount:
      type: object
      properties:
        value:
          type: number
        base:
          type: array
          items:
            type: string
            enum:
            - NET_ROOM_PRICE
            - PROPERTY_CHARGES
            - LOCALITY_CHARGES
        mode:
          type: string
          enum:
          - HOUR
          - MINUTE
          - BOOKING
          - WEEK
          - NIGHT
          - DAY
          - PERSON_STAY
          - PERSON_NIGHT
          - PERSON_DAY
          - PERCENTAGE
    OctorateApplicable:
      type: object
      properties:
        from:
          type: string
          format: date-time
        to:
          type: string
          format: date-time
    OctorateBrazilTaxDetails:
      type: object
      properties:
        taxPayerNumber:
          type: string
        taxPayerNumberType:
          type: string
          enum:
          - CNPJ
          - CPF
        cityHallId:
          type: string
        email:
          type: string
    OctorateChargeKey:
      type: object
      properties:
        type:
          type: string
        guestOrigin:
          type: string
          enum:
          - ANY
          - DOMESTIC
          - INTERNATIONAL
        travelPurpose:
          type: string
          enum:
          - ANY
          - LEISURE
          - BUSINESS
    OctorateChargePeriod:
      type: object
      properties:
        applicable:
          $ref: "#/components/schemas/OctorateApplicable"
        configuration:
          $ref: "#/components/schemas/OctorateConfiguration"
    OctorateChildAge:
      type: object
      properties:
        multiplier:
          type: number
        lte:
          type: integer
          format: int32
    OctorateConfiguration:
      type: object
      properties:
        amount:
          $ref: "#/components/schemas/OctorateAmount"
        childAges:
          type: array
          items:
            $ref: "#/components/schemas/OctorateChildAge"
        excluded:
          type: boolean
    OctorateDamagePolicy:
      type: object
      properties:
        amount:
          type: number
          format: double
        currency:
          type: string
        policyType:
          type: string
          enum:
          - NONE
          - HANDLED_BY_PROPERTY
          - HANDLED_BY_OTA
        damageProgrammeTermsAgreed:
          type: boolean
        collectionMode:
          type: string
          enum:
          - CASH
          - CREDIT_CARD
          - PAYPAL
          - BANK_TRANSFER
          - OTHER
        collectionWhen:
          type: string
          enum:
          - ON_ARRIVAL
          - SEVEN_DAYS_BEFORE_ARRIVAL
          - FOURTEEN_DAYS_BEFORE_ARRIVAL
        returnMode:
          type: string
          enum:
          - CASH
          - CREDIT_CARD
          - PAYPAL
          - BANK_TRANSFER
          - OTHER
        returnWhen:
          type: string
          enum:
          - ON_CHECKOUT
          - WITHIN_7_DAYS
          - WITHIN_14_DAYS
      description: External damage policy
    OctorateFrenchTaxDetails:
      type: object
      properties:
        categoryId:
          type: string
          enum:
          - ID_11
          - ID_12
          - ID_13
          - ID_14
          - ID_15
          - ID_16
          - ID_17
          - ID_18
          - ID_19
          - ID_100
        natureId:
          type: string
          enum:
          - ID_1
          - ID_2
          - ID_3
          - ID_4
          - ID_5
          - ID_6
          - ID_7
          - ID_8
          - ID_9
        declareRevenue:
          type: boolean
        hasVat:
          type: boolean
        registeredInRcs:
          type: boolean
      description: French tax details
    OctorateInvoiceSettings:
      type: object
      properties:
        legalName:
          type: string
        contactPerson:
          type: string
        address:
          type: string
        country:
          type: string
          enum:
          - AF
          - AX
          - AL
          - DZ
          - AS
          - AD
          - AO
          - AI
          - AQ
          - AG
          - AR
          - AM
          - AW
          - AU
          - AT
          - AZ
          - BS
          - BH
          - BD
          - BB
          - BY
          - BE
          - BZ
          - BJ
          - BM
          - BT
          - BO
          - BQ
          - BA
          - BW
          - BV
          - BR
          - IO
          - BN
          - BG
          - BF
          - BI
          - KH
          - CM
          - CA
          - CV
          - KY
          - CF
          - TD
          - CL
          - CN
          - CX
          - CC
          - CO
          - KM
          - CG
          - CD
          - CK
          - CR
          - CI
          - HR
          - CU
          - CW
          - CY
          - CZ
          - DK
          - DJ
          - DM
          - DO
          - EC
          - EG
          - SV
          - GQ
          - ER
          - EE
          - ET
          - FK
          - FO
          - FJ
          - FI
          - FR
          - GF
          - PF
          - TF
          - GA
          - GM
          - GE
          - DE
          - GH
          - GI
          - GR
          - GL
          - GD
          - GP
          - GU
          - GT
          - GG
          - GN
          - GW
          - GY
          - HT
          - HM
          - VA
          - HN
          - HK
          - HU
          - IS
          - IN
          - ID
          - IR
          - IQ
          - IE
          - IM
          - IL
          - IT
          - JM
          - JP
          - JE
          - JO
          - KZ
          - KE
          - KI
          - KP
          - KR
          - KW
          - KG
          - LA
          - LV
          - LB
          - LS
          - LR
          - LY
          - LI
          - LT
          - LU
          - MO
          - MK
          - MG
          - MW
          - MY
          - MV
          - ML
          - MT
          - MH
          - MQ
          - MR
          - MU
          - YT
          - MX
          - FM
          - MD
          - MC
          - MN
          - ME
          - MS
          - MA
          - MZ
          - MM
          - NA
          - NR
          - NP
          - NL
          - NC
          - NZ
          - NI
          - NE
          - NG
          - NU
          - NF
          - MP
          - "NO"
          - OM
          - PK
          - PW
          - PS
          - PA
          - PG
          - PY
          - PE
          - PH
          - PN
          - PL
          - PT
          - PR
          - QA
          - RE
          - RO
          - RU
          - RW
          - BL
          - SH
          - KN
          - LC
          - MF
          - PM
          - VC
          - WS
          - SM
          - ST
          - SA
          - SN
          - RS
          - SC
          - SL
          - SG
          - SX
          - SK
          - SI
          - SB
          - SO
          - ZA
          - GS
          - SS
          - ES
          - LK
          - SD
          - SR
          - SJ
          - SZ
          - SE
          - CH
          - SY
          - TW
          - TJ
          - TZ
          - TH
          - TL
          - TG
          - TK
          - TO
          - TT
          - TN
          - TR
          - TM
          - TC
          - TV
          - UG
          - UA
          - AE
          - GB
          - US
          - UM
          - UY
          - UZ
          - VU
          - VE
          - VN
          - VG
          - VI
          - WF
          - EH
          - YE
          - ZM
          - ZW
          - XJ
        city:
          type: string
        postalCode:
          type: string
        state:
          type: string
        notificationChannel:
          type: string
          enum:
          - POSTAL_MAIL
          - EMAIL
        brazilTaxDetails:
          $ref: "#/components/schemas/OctorateBrazilTaxDetails"
      description: Invoice settings details
    OctoratePropertyCharge:
      type: object
      properties:
        chargeKey:
          $ref: "#/components/schemas/OctorateChargeKey"
        chargePeriods:
          type: array
          items:
            $ref: "#/components/schemas/OctorateChargePeriod"
    OctoratePropertyCheckinAdditionalInfo:
      type: object
      properties:
        otherText:
          $ref: "#/components/schemas/OctoratePropertyCheckinOtherText"
        location:
          $ref: "#/components/schemas/OctoratePropertyCheckinLocation"
        brandName:
          type: string
        instruction:
          $ref: "#/components/schemas/OctoratePropertyCheckinInstruction"
    OctoratePropertyCheckinExternalReference:
      type: object
      properties:
        sequence:
          type: integer
          format: int32
        type:
          type: string
          enum:
          - IMAGE_SERVICE
        references:
          $ref: "#/components/schemas/OctoratePropertyCheckinReferenceDetails"
    OctoratePropertyCheckinInstruction:
      type: object
      properties:
        how:
          type: string
          enum:
          - PHONE
          - EMAIL
          - SMS
          - OTHER
        when:
          type: string
          enum:
          - IMMEDIATE
          - MONTH_BEFORE
          - WEEK_BEFORE
          - DAY_OF_ARRIVAL
        identifier:
          type: string
        other:
          type: string
    OctoratePropertyCheckinLocation:
      type: object
      properties:
        offLocation:
          type: boolean
        address:
          type: string
        city:
          type: string
        zip:
          type: string
        placeId:
          type: string
    OctoratePropertyCheckinMethod:
      type: object
      properties:
        portal:
          $ref: "#/components/schemas/PortalNames"
        streamVariationName:
          type: string
          enum:
          - PRIMARY_CHECKIN_METHOD
          - ALTERNATIVE_CHECKIN_METHOD
        portalValue:
          type: string
        additionalInfo:
          $ref: "#/components/schemas/OctoratePropertyCheckinAdditionalInfo"
        externalReferences:
          type: array
          items:
            $ref: "#/components/schemas/OctoratePropertyCheckinExternalReference"
        editable:
          type: boolean
        model:
          type: string
          enum:
          - HOUR
          - MINUTE
          - BOOKING
          - WEEK
          - NIGHT
          - DAY
          - PERSON_STAY
          - PERSON_NIGHT
          - PERSON_DAY
          - PERCENTAGE
        inclusive:
          type: boolean
        codeType:
          type: string
          readOnly: true
          enum:
          - FEE_PERSONAL
          - CHARGE_TYPE
          - IMAGE_TAGS
          - SERVICE
          - PAYMENTS_CARD
          - LANGUAGES
          - BREAKFAST
          - CANCEL_POLICY
          - ROOM_AMENITY
          - INTERNET_CONNECTION_TYPES
          - INTERNET_CONNECTION_COVERAGE
          - PARKING_TYPE
          - BED_TYPE
          - CONTACT_TYPE
          - CONTACT_LANGUAGE
          - EXTRABED_GUEST_TYPE
          - BOOKING_ACCEPTED_GUESTS
          - FEE_TAX
          - RATE_OFFER
          - PRODUCT_BENEFIT
          - ACCOMMODATION_CATEGORY
          - CITY_TAX_CATEGORY
          - CITY_TAX_NATURE
          - CANCEL_POLICY_DEPOSIT
          - ROOM_CATEGORY
          - ROOM_CLASS
          - BEDROOM_TYPE
          - ROOM_NAMING
          - PHOTO_TYPE
          - LISTING_EXPECTATION
          - PROPERTY_CHECKIN_METHOD
          - BATHROOM_LOCATION
        valueType:
          type: string
          enum:
          - FIXED
          - PERCENT
        amount:
          type: number
        configuration:
          type: string
          writeOnly: true
          enum:
          - INCLUSIVE
          - EXCLUSIVE
        deletable:
          type: boolean
        propertyCharge:
          $ref: "#/components/schemas/OctoratePropertyCharge"
    OctoratePropertyCheckinMethods:
      type: object
      properties:
        checkinMethods:
          type: array
          items:
            $ref: "#/components/schemas/OctoratePropertyCheckinMethod"
      description: Property checkin methods
    OctoratePropertyCheckinOtherText:
      type: object
      properties:
        lang:
          type: string
          enum:
          - IT
          - EN
          - FR
          - ES
          - DE
          - RU
          - PT
          - NL
          - JA
          - EL
          - TR
          - ZH
          - CA
          - RO
        text:
          type: string
    OctoratePropertyCheckinReferenceDetails:
      type: object
      properties:
        photoId:
          type: string
        photoUri:
          type: string
        octorateTempFilePath:
          type: string
    OctorateQuietHours:
      type: object
      properties:
        enabled:
          type: boolean
        startTime:
          type: string
          format: date-time
        endTime:
          type: string
          format: date-time
      description: External quiet hours policy
    PlaceInterface:
      type: object
      properties:
        latitude:
          type: number
          format: double
        longitude:
          type: number
          format: double
        civicNumber:
          type: string
        zipCode:
          type: string
        districtName:
          type: string
        zoom:
          type: integer
          format: int32
        additionalInformation:
          type: string
        phone2:
          type: string
        phonePrefix:
          type: string
        countryAlpha2:
          type: string
        firstLocality:
          type: string
        phone:
          type: string
        city:
          type: string
        locality:
          type: string
        address:
          type: string
      description: Place information
    PortalNames:
      type: object
      properties:
        dbName:
          type: string
        airbnb:
          type: boolean
        booking:
          type: boolean
        ctrip:
          type: boolean
        agoda:
          type: boolean
        expedia:
          type: boolean
        homeaway:
          type: boolean
        rakuten:
          type: boolean
        enumDescriptor:
          type: string
          enum:
          - BOOKING
          - AIRBNB
          - HOMEAWAY
          - 
          - HOSTELWORLD
          - HOLIDU
          - CTRIP
          - RENTALS_UNITED
        marriotVr:
          type: boolean
        homeToGo:
          type: boolean
        displayName:
          type: string
      example: AIRBNB
      enum:
      - "booking_xml, airbnb_xml, homeaway"
    ApiExtraBedRequest:
      type: object
      properties:
        ageRestriction:
          type: integer
          format: int32
        quantityAvailable:
          type: integer
          format: int32
        price:
          type: number
    ApiFeeRequest:
      required:
      - amount
      - chargeType
      - exclusive
      - portalValue
      type: object
      properties:
        portalValue:
          type: string
          description: Portal specific value (Meta value)
          example: "Airbnb {PASS_THROUGH_LINEN_FEE, PASS_THROUGH_COMMUNITY_FEE,PASS_THROUGH_MANAGEMENT_FEE,\
            \ PASS_THROUGH_RESORT_FEE}"
        chargeType:
          type: string
          description: Portal specific value of the charge type
          example: "PERCENT, PER_DAY, etc..."
        amount:
          type: number
          description: Money requested for this fee
          format: double
        exclusive:
          type: boolean
          description: "Whether this field is given with the room, or it's optionable"
          default: false
        category:
          type: string
          description: Whether this FEE is a TAX or not
          enum:
          - FEE
          - TAX
        internetType:
          type: string
          description: "For internet fees alike: Type of internet connection according\
            \ to the portal"
          nullable: true
          example: "null"
        internetCoverage:
          type: string
          description: "For internet fees alike: Type of coverage, like by cable or\
            \ wifi (Meta value)"
          nullable: true
          example: "null"
        parkingType:
          type: string
          description: "For parking fees alike: Parking type according to portal (Meta\
            \ value)"
          nullable: true
          example: "null"
        parkingNeedReservation:
          type: boolean
          description: "For parking fees alike: true if this kind of parking area\
            \ needs reservation (Meta value)"
          nullable: true
          example: false
        parkingPublicArea:
          type: boolean
          description: "For parking fees alike: True if it's inside a public area,\
            \ false if private parking (Meta value)"
          nullable: true
          example: false
    ExternalService:
      type: object
      properties:
        portal:
          $ref: "#/components/schemas/PortalNames"
        portalValue:
          type: string
          readOnly: true
        quantity:
          type: integer
          description: Quantity available for this service
          format: int32
        price:
          type: number
          description: The price asked for this service
        configuration:
          type: string
          description: IS this configuration included or excluded?
          enum:
          - INCLUSIVE
          - EXCLUSIVE
        exists:
          type: boolean
          description: True if this service actually exists inside the structure or
            it's not temporarary available
        roomLevel:
          type: boolean
          description: Whether is applicable to a room or to the property
        acceptedBreakfast:
          uniqueItems: true
          type: array
          description: "According to the portal, list of accepted breakfast"
          items:
            type: string
            description: "According to the portal, list of accepted breakfast"
        octorateParkingDetails:
          $ref: "#/components/schemas/OctorateParkingDetails"
        octoratePaymentDetails:
          $ref: "#/components/schemas/OctoratePaymentDetails"
        octorateSwimmingPoolDetails:
          $ref: "#/components/schemas/OctorateSwimmingPoolDetails"
        octorateRestaurantDetails:
          $ref: "#/components/schemas/OctorateRestaurantDetails"
        octorateInternetDetails:
          $ref: "#/components/schemas/OctorateInternetDetails"
        octorateKidsPoolDetails:
          $ref: "#/components/schemas/OctorateKidsPoolDetails"
        octorateOnSiteDetails:
          $ref: "#/components/schemas/OctorateOnSiteDetails"
        octorateAgeLimitDetails:
          $ref: "#/components/schemas/OctorateAgeLimitDetails"
        octorateScheduleDetails:
          $ref: "#/components/schemas/OctorateScheduleDetails"
        octorateTemporarilyClosedDetails:
          $ref: "#/components/schemas/OctorateTemporarilyClosedDetails"
        octorateSurchargeDetails:
          $ref: "#/components/schemas/OctorateSurchargeDetails"
        octorateMealDetails:
          $ref: "#/components/schemas/OctorateMealDetails"
        editable:
          type: boolean
        deletable:
          type: boolean
        model:
          type: string
          enum:
          - HOUR
          - MINUTE
          - BOOKING
          - WEEK
          - NIGHT
          - DAY
          - PERSON_STAY
          - PERSON_NIGHT
          - PERSON_DAY
          - PERCENTAGE
        inclusive:
          type: boolean
        codeType:
          type: string
          readOnly: true
          enum:
          - FEE_PERSONAL
          - CHARGE_TYPE
          - IMAGE_TAGS
          - SERVICE
          - PAYMENTS_CARD
          - LANGUAGES
          - BREAKFAST
          - CANCEL_POLICY
          - ROOM_AMENITY
          - INTERNET_CONNECTION_TYPES
          - INTERNET_CONNECTION_COVERAGE
          - PARKING_TYPE
          - BED_TYPE
          - CONTACT_TYPE
          - CONTACT_LANGUAGE
          - EXTRABED_GUEST_TYPE
          - BOOKING_ACCEPTED_GUESTS
          - FEE_TAX
          - RATE_OFFER
          - PRODUCT_BENEFIT
          - ACCOMMODATION_CATEGORY
          - CITY_TAX_CATEGORY
          - CITY_TAX_NATURE
          - CANCEL_POLICY_DEPOSIT
          - ROOM_CATEGORY
          - ROOM_CLASS
          - BEDROOM_TYPE
          - ROOM_NAMING
          - PHOTO_TYPE
          - LISTING_EXPECTATION
          - PROPERTY_CHECKIN_METHOD
          - BATHROOM_LOCATION
        breakfastApplicable:
          type: boolean
        bookingChildren:
          type: boolean
        extraBed:
          type: boolean
        valueType:
          type: string
          enum:
          - FIXED
          - PERCENT
        amount:
          type: number
        propertyCharge:
          $ref: "#/components/schemas/OctoratePropertyCharge"
    OctorateAgeLimitDetails:
      type: object
      properties:
        ageLimit:
          type: string
          enum:
          - AGE_1
          - AGE_2
          - AGE_3
          - AGE_4
          - AGE_5
          - AGE_6
          - AGE_7
          - AGE_8
          - AGE_9
          - AGE_10
          - AGE_11
          - AGE_12
          - NO_RESTRICTION
      description: Age limit details
    OctorateChargeDetails:
      type: object
      properties:
        price:
          type: number
          format: double
        frequency:
          type: string
          enum:
          - UNKNOWN_FREQUENCY
          - PER_STAY
          - PER_MINUTE
          - PER_HALF_HOUR
          - PER_HOUR
          - PER_DAY
          - PER_WEEK
    OctorateDaytime:
      type: object
      properties:
        hours:
          type: integer
          format: int32
        minutes:
          type: integer
          format: int32
    OctorateEpochTimestamp:
      type: object
      properties:
        epochSeconds:
          type: integer
          format: int64
    OctorateInternetDetails:
      type: object
      properties:
        area:
          type: string
          enum:
          - UNKNOWN_COVERAGE
          - ALL_ROOMS
          - SOME_ROOMS
          - PUBLIC_AREAS
          - BUSINESS_CENTER
          - ENTIRE_PROPERTY
        type:
          type: string
          enum:
          - NONE
          - WIRED
          - WIFI
        wifiInfo:
          $ref: "#/components/schemas/OctorateWifiInfo"
      description: Internet details
    OctorateKidsPoolDetails:
      type: object
      properties:
        swimmingPoolDimensions:
          $ref: "#/components/schemas/OctorateSwimmingPoolDimensions"
        shallowEnd:
          type: boolean
      description: Kids pool details
    OctorateMealDetails:
      type: object
      properties:
        breakfastTypes:
          type: array
          items:
            type: string
            enum:
            - CONTINENTAL
            - ITALIAN
            - FULL_ENGLISH
            - VEGETARIAN
            - VEGAN
            - HALAL
            - GLUTEN_FREE
            - KOSHER
            - ASIAN
            - AMERICAN
            - BUFFET
            - A_LA_CARTE
            - BREAKFAST_TO_GO
        breakfastFoodItemTypes:
          type: array
          items:
            type: string
            enum:
            - BREAD
            - PASTRIES
            - PANCAKES
            - BUTTER
            - CHEESE
            - COLD_MEAT
            - EGGS
            - YOGURT
            - FRUITS
            - COFFEE
            - TEA
            - HOT_CHOCOLATE
            - CHAMPAGNE
            - A_LA_CARTE
            - LOCAL_SPECIALITY
            - COOKED_MEAL
            - JUICE
            - JAM
            - CEREAL
        price:
          type: number
      description: Meal details
    OctorateOnSiteDetails:
      type: object
      properties:
        onsiteType:
          type: string
          enum:
          - DEFAULT
          - ONSITE
          - OFFSITE
      description: On-site details
    OctorateParkingDetails:
      type: object
      properties:
        name:
          type: string
        parkingType:
          type: string
          enum:
          - UNKNOWN_PARKING_TYPE
          - PARKING_GARAGE
          - PARKING_LOT
          - STREET_PARKING
        parkingLocation:
          type: string
          enum:
          - ON_SITE
          - NEARBY
        parkingAccess:
          type: string
          enum:
          - ONLY_GUESTS
          - GENERAL_PUBLIC
        parkingReservation:
          type: string
          enum:
          - NEEDED
          - NOT_NEEDED
          - NOT_POSSIBLE
        maxHeightM:
          type: number
          format: double
        hasValetService:
          type: string
          enum:
          - NOT_SPECIFIED
          - PRESENT
          - MISSING
        hasOnsiteStaff:
          type: string
          enum:
          - NOT_SPECIFIED
          - PRESENT
          - MISSING
        hasGatedParking:
          type: string
          enum:
          - NOT_SPECIFIED
          - PRESENT
          - MISSING
        hasSecurityCameras:
          type: string
          enum:
          - NOT_SPECIFIED
          - PRESENT
          - MISSING
        hasEvChargingStation:
          type: string
          enum:
          - NOT_SPECIFIED
          - PRESENT
          - MISSING
        hasAccessibleParkingSpots:
          type: string
          enum:
          - NOT_SPECIFIED
          - PRESENT
          - MISSING
      description: Details on the parking
    OctoratePaymentDetails:
      type: object
      properties:
        chargeMode:
          type: string
          enum:
          - UNKNOWN_CHARGE_MODE
          - FREE
          - PAID
          - CHARGES_MAY_APPLY
        chargeDetails:
          $ref: "#/components/schemas/OctorateChargeDetails"
      description: Payment details
    OctorateRestaurantDetails:
      type: object
      properties:
        name:
          type: string
        guestsOnly:
          type: boolean
        acceptReservations:
          type: boolean
        outdoorSeating:
          type: boolean
        mealTypes:
          uniqueItems: true
          type: array
          items:
            type: string
            enum:
            - UNKNOWN_MEAL_TYPE
            - HALAL
            - KOSHER
            - VEGETARIAN
            - VEGAN
            - GLUTEN_FREE
            - DAIRY_FREE
        ambiances:
          uniqueItems: true
          type: array
          items:
            type: string
            enum:
            - UNKNOWN_AMBIANCE
            - FAMILY_KIDS_FRIENDLY
            - TRADITIONAL
            - MODERN
            - ROMANTIC
        openForMeals:
          uniqueItems: true
          type: array
          items:
            type: string
            enum:
            - UNKNOWN_OPEN_FOR_MEALS
            - BREAKFAST
            - BRUNCH
            - LUNCH
            - DINNER
            - HIGH_TEA
            - COCKTAIL_HOUR
        cuisines:
          uniqueItems: true
          type: array
          items:
            type: string
            enum:
            - UNKNOWN_CUISINE
            - AFRICAN
            - AMERICAN
            - ARGENTINIAN
            - BELGIAN
            - BRAZILIAN
            - CAJUN_CREOLE
            - CAMBODIAN
            - CANTONESE
            - CARIBBEAN
            - CATALAN
            - CHINESE
            - DUTCH
            - BRITISH
            - ETHIOPIAN
            - FRENCH
            - GREEK
            - INDIAN
            - INDONESIAN
            - IRISH
            - ITALIAN
            - JAPANESE
            - KOREAN
            - MALAYSIAN
            - MEDITERRANEAN
            - MEXICAN
            - MIDDLE_EASTERN
            - MOROCCAN
            - NEPALESE
            - PERUVIAN
            - PIZZA
            - POLISH
            - PORTUGUESE
            - SCOTTISH
            - SEAFOOD
            - SICHUAN
            - SINGAPOREAN
            - SPANISH
            - STEAKHOUSE
            - SUSHI
            - TEXMEX
            - THAI
            - TURKISH
            - VIETNAMESE
            - AUSTRIAN
            - AUSTRALIAN
            - GERMAN
            - RUSSIAN
            - LOCAL
            - ASIAN
            - INTERNATIONAL
            - LATIN_AMERICAN
            - EUROPEAN
            - CROATIAN
            - HUNGARIAN
            - GRILL_BBQ
            - SOUTH_AFRICAN
        buffet:
          type: boolean
        alacarte:
          type: boolean
      description: Restaurant details
    OctorateScheduleDetails:
      type: object
      properties:
        schedule:
          type: array
          items:
            $ref: "#/components/schemas/OctorateWeekTimeEntry"
      description: Schedule details
    OctorateSurchargeDetails:
      type: object
      properties:
        surchargeType:
          type: string
          enum:
          - DEFAULT
          - FREE
          - PAID
      description: Surcharge details
    OctorateSwimmingPoolDetails:
      type: object
      properties:
        name:
          type: string
        swimmingPoolType:
          type: string
          enum:
          - UNKNOWN_POOL_TYPE
          - INDOOR
          - OUTDOOR
          - INDOOR_AND_OUTDOOR
        availabilityType:
          type: string
          enum:
          - UNKNOWN_AVAILABILITY
          - ALL_SEASON
          - SEASONABLE
        allowedAgeType:
          type: string
          enum:
          - UNKNOWN_AGE_TYPE
          - ADULTS_ONLY
          - KIDS_ONLY
          - ALL_AGES
        hasLoungers:
          type: boolean
        hasWaterSlide:
          type: boolean
        hasPoolBar:
          type: boolean
        hasPoolCover:
          type: boolean
        hasFreeTowels:
          type: boolean
        hasPoolToys:
          type: boolean
        hasSunUmbrellas:
          type: boolean
        hasFenceAroundPool:
          type: boolean
        hasSnakeTrap:
          type: boolean
        shared:
          type: boolean
        rooftop:
          type: boolean
        shallowEnd:
          type: boolean
        infinity:
          type: boolean
        heated:
          type: boolean
        saltWater:
          type: boolean
        poolWithView:
          type: boolean
        plungePool:
          type: boolean
      description: Swimming pool details
    OctorateSwimmingPoolDimensions:
      type: object
      properties:
        length:
          type: number
          format: double
        width:
          type: number
          format: double
        depthMin:
          type: number
          format: double
        depthMax:
          type: number
          format: double
        unit:
          type: string
          enum:
          - UNKNOWN_UNIT
          - METER
    OctorateTemporarilyClosedDetails:
      type: object
      properties:
        closed:
          type: array
          items:
            $ref: "#/components/schemas/OctorateTemporarilyClosedEntry"
      description: Temporarily closed details
    OctorateTemporarilyClosedEntry:
      type: object
      properties:
        startDate:
          $ref: "#/components/schemas/OctorateEpochTimestamp"
        endDate:
          $ref: "#/components/schemas/OctorateEpochTimestamp"
        startDateAsDate:
          type: string
          format: date-time
        endDateAsDate:
          type: string
          format: date-time
    OctorateWeekTimeEntry:
      type: object
      properties:
        from:
          $ref: "#/components/schemas/OctorateDaytime"
        to:
          $ref: "#/components/schemas/OctorateDaytime"
        dayOfWeek:
          type: string
          enum:
          - UNKNOWN_DAY
          - MONDAY
          - TUESDAY
          - WEDNESDAY
          - THURSDAY
          - FRIDAY
          - SATURDAY
          - SUNDAY
        fromAsDate:
          type: string
          format: date-time
        toAsDate:
          type: string
          format: date-time
    OctorateWifiInfo:
      type: object
      properties:
        networkName:
          type: string
        speedDownload:
          type: number
          format: double
        speedUpload:
          type: number
          format: double
    ApiPaymentStepDTO:
      required:
      - accommodationId
      - stepType
      - title
      type: object
      properties:
        id:
          type: integer
          description: Id of the payment step
          format: int64
          readOnly: true
          example: 12
        stepType:
          type: string
          description: Payment Step Type
          example: CANCELLATION
          enum:
          - PAYMENT
          - CANCELLATION
        disabled:
          type: boolean
          description: Indicates if the payment step is disabled
          example: true
        codice:
          type: string
          description: Indicates the code of accommodation
          example: "123456"
        ignoreRatePlan:
          type: boolean
          description: True if this step is ignored by rate plan
        accommodationId:
          type: string
          description: Id of the accommodation
          example: "123456"
        title:
          type: string
          example: Refundable 30 days
        days:
          type: integer
          description: Number of days for the condition
          format: int32
          example: 30
        beforeCheckin:
          type: boolean
          description: True if the condition is before check-in
          example: true
        notRefundable:
          type: boolean
          description: True if the condition is non-refundable
          example: true
        newReservations:
          type: boolean
          description: True if the rule applies only to new reservations
          example: true
        chargeCreditCard:
          type: boolean
          description: True if the credit card will be charged
          example: true
        valueFixed:
          type: number
          description: Fixed value to charge
          example: 100.0
        valuePercent:
          type: integer
          description: Percentage value to charge
          format: int32
          example: 50
        valueNights:
          type: integer
          description: Number of nights to charge
          format: int32
          example: 2
        templateId:
          type: integer
          description: ID of the template used
          format: int64
          example: 101
        templateNotify:
          type: integer
          description: ID of the notification template
          format: int64
          example: 102
        checkinFrom:
          type: string
          description: Start date of valid check-in
          format: date-time
        checkinTo:
          type: string
          description: End date of valid check-in
          format: date-time
        createdFrom:
          type: string
          description: Start date when the rule is active
          format: date-time
        createdTo:
          type: string
          description: End date when the rule is active
          format: date-time
        vcc:
          type: boolean
          description: True if Virtual Credit Card is supported
          example: true
        hour:
          type: string
          description: Specific hour for applying the rule
          example: 16:00
        roomIds:
          type: array
          description: List of room IDs the rule applies to
          items:
            type: string
            description: List of room IDs the rule applies to
        portalNames:
          type: array
          description: List of portal names the rule applies to
          items:
            type: string
            description: List of portal names the rule applies to
        filterPayMode:
          type: array
          description: List of payment modes the rule filters
          items:
            type: string
            description: List of payment modes the rule filters
            enum:
            - UNKNOWN
            - CASH
            - CREDITCARD
            - PREPAID
            - BANKTRANSFER
            - NOTPAID
            - PAYPAL
            - CHEQUE
            - TRAVELCHEQUE
            - TREASURY_OFFICE
            - BONCADEAU
            - TREASURY_RECEIPT
            - COMMISSION
        calculateValues:
          type: array
          description: List of values used for calculation
          items:
            type: string
            description: List of values used for calculation
            enum:
            - ROOM
            - EXTRA
            - CITYTAX
            - DEPOSIT
            - CLEANING_FEE
        cancellationTitle:
          type: object
          additionalProperties:
            type: string
            description: Localized titles for cancellation policies
          description: Localized titles for cancellation policies
        cancellationDetail:
          type: object
          additionalProperties:
            type: string
            description: Localized details for cancellation policies
          description: Localized details for cancellation policies
        refundAfterDays:
          type: integer
          description: The number of days after which the reservation will be refunded
          format: int32
          example: 30
      description: Cancellation Policy / Payment Policy
    ApiConnectionDTO:
      required:
      - channelId
      - portal
      type: object
      properties:
        currency:
          type: string
          description: Currency of this connection
        id:
          type: integer
          format: int64
          readOnly: true
        channelId:
          type: integer
          description: Portal name retrieved from 'Portal enabled call'. Writable
            only in creation
          format: int64
        channelName:
          type: string
          description: Just an information about the portal name
          nullable: true
          readOnly: true
        accommodationId:
          type: string
          description: Quick reference to the property ID
          readOnly: true
        hotelId:
          type: string
          description: "This is the ID of the hotel on the external channel. Are you\
            \ a Property Manager? <br/>Please specify here the account ID that identify\
            \ all the account of the property manager. How this is used? <br/>When\
            \ a PM connection is shared between different accounts, we group by hotel\
            \ id to retrieve the same PM info."
          nullable: true
        userLogged:
          type: boolean
          description: Means if user has logged in and this portal connection is authorized
            to operate.
          readOnly: true
        updateCalendar:
          type: boolean
          description: "True for calendar synchronization active, false otherwise.\
            \ * It can be activated only after mapping"
        pullReservations:
          type: boolean
          description: True if this connection can receive reservations. * It can
            be activated only after mapping
        pullMappedOnly:
          type: boolean
          description: True if only reservations linked to mapped rooms can be imported.
          default: true
        content:
          type: boolean
          description: true if this portal connection allows content handling
        mailOnError:
          type: boolean
          description: true if the customer should receive an email if the connection
            got an error
        calendarValues:
          type: array
          description: "List of manageable values, leave defaults if you don't know\
            \ which one to use"
          items:
            type: string
            description: "List of manageable values, leave defaults if you don't know\
              \ which one to use"
            enum:
            - PRICE
            - AVAILABILITY
            - MINSTAY
            - MAXSTAY
            - CLOSEARR
            - CLOSEDEP
            - STOPSELL
            - CUTOFF
        username:
          type: string
          description: Username of the hotel to access the external site
          nullable: true
        password:
          type: string
          description: Password of the hotel to access the external site
          nullable: true
          writeOnly: true
        loginAt:
          type: string
          description: "If oauth is required, the next step to follow"
          readOnly: true
        correctionRatio:
          type: number
          description: "Correction ratio for this connection, whether is set inside\
            \ this will be add to the price to the portal (only new channel connections)"
        correctionFixed:
          type: boolean
          description: Set as TRUE if the value to be added is FIXED otherwise set
            false (PERCENT)
        correctionRound:
          type: boolean
          description: Should the price rounded?
        commission:
          type: number
          description: Custom commission to apply to this portal
        messages:
          type: boolean
          description: Enable messaging
        availabilityPercentage:
          type: integer
          description: The percentage of the set avail to send to the portal
          format: int32
          default: 100
        portal:
          $ref: "#/components/schemas/ApiPortalDTOResp"
        accommodation:
          $ref: "#/components/schemas/ApiAccommodationLight"
        newChannel:
          type: boolean
          description: "New Channel: Describe if this channel is handled by the most\
            \ recent technlogies in octorate"
          readOnly: true
        lastPortalAcceptLog:
          $ref: "#/components/schemas/ApiLogDTO"
        hasBasicRooms:
          type: boolean
          description: True if there is at least a Basic Room
          readOnly: true
        hasPmsRooms:
          type: boolean
          description: True if there is at least a Pms Room
          readOnly: true
        status:
          type: string
          description: The status of the portal connection
          readOnly: true
          enum:
          - DISABLED
          - WAITING
          - ENABLED
        color:
          type: string
          description: The color of the portal connection
    ApiExternalRoomDTO:
      required:
      - occupancy
      - roomId
      - roomName
      type: object
      properties:
        id:
          type: integer
          description: The octorate ID of this external room
          format: int64
        roomName:
          type: string
          description: Parsed room name from Octorate
        roomId:
          type: string
          description: Parsed room id from Octorate
        rateName:
          type: string
          description: Parsed rate name from octorate
        rateId:
          type: string
          description: Parsed rate id from octorate
        occupancy:
          type: integer
          description: Occupancy provided by the portal
          format: int32
        manageable:
          type: boolean
          description: "If not manageable, this rate is provide to you to inform you\
            \ of the existence, but it cannot be used from channel managers"
          default: true
        pmsRoom:
          type: boolean
          description: "If true this room describe a pms room (the 101,102,103 room\
            \ of type double) inside the portal"
          default: false
        createTime:
          type: string
          description: When this room was imported in octorate
          format: date-time
          readOnly: true
        referenceId:
          type: string
          description: External reference ID. This is the id provided by the portal
          readOnly: true
    ApiMapping:
      required:
      - externalId
      - portalConnection
      - productId
      type: object
      properties:
        portalConnection:
          type: integer
          description: Portal connection that handles this mapping
          format: int64
        productId:
          type: integer
          description: The Octorate product id (room or rate)
          format: int64
        externalId:
          type: integer
          description: 'The external ID '
          format: int64
        id:
          type: integer
          description: Element id
          format: int64
          readOnly: true
    ApiExtraProduct:
      required:
      - model
      - name
      type: object
      properties:
        id:
          type: integer
          description: Id of this product (to identity the same extras)
          format: int64
          readOnly: true
          example: 12322
        name:
          type: string
          description: name of this extra
        accommodation:
          $ref: "#/components/schemas/ApiAccommodationLight"
        enabled:
          type: boolean
          description: true if this extra is currently enabled
          default: false
        mandatory:
          type: boolean
          description: true if this extra must be book on booking engine
          default: false
        refundable:
          type: boolean
          description: true if this product is refundable
          default: false
        model:
          type: string
          description: "Describe the type of calculation done with the base price,\
            \ the reservation nights, the pax, etc..."
          enum:
          - BOOKING
          - WEEK
          - DAY
          - PERSONBOOKING
          - PERSONDAY
          - PERSONWEEK
          - QUANTITY
          - QUANTITYDAY
          - PERSON
          - CHILDREN
          - CHILDRENDAY
          - ADULTSDAY
        basePrice:
          minimum: 0
          type: number
          description: Base price for calculate this extra
          default: 0
        taxPercent:
          maximum: 100
          minimum: 0
          type: number
          description: Tax to apply (in 0-100% value)
          default: 0
        description:
          type: object
          additionalProperties:
            type: string
            description: Description to show in different languages
            nullable: true
          description: Description to show in different languages
          nullable: true
        title:
          type: object
          additionalProperties:
            type: string
            description: Title to show in different languages
            nullable: true
          description: Title to show in different languages
          nullable: true
        category:
          type: string
          description: Category where put this item
          nullable: true
        roomFilter:
          type: array
          description: "Normally this product applies to all the rooms of the accommodation\
            \ (null).  If you want to use only for selected rooms, you can filter\
            \ the rooms to associate with the extra"
          nullable: true
          items:
            $ref: "#/components/schemas/ApiListingLight"
        validDays:
          type: array
          description: The list of valid days
          items:
            type: string
            description: The list of valid days
            enum:
            - CHECKIN
            - STAY
            - CHECKOUT
        showCalendar:
          type: boolean
          description: If the product is enabled to view the calendar return true
          default: false
        externalId:
          type: string
          description: The external id of the product
        displayOnPms:
          type: boolean
          description: Is this extra visible on PMS?
          default: false
        extraCategoryId:
          type: integer
          description: The id of product/extra category
          format: int64
        displayBookingEngine:
          type: boolean
          description: Is this extra visible on Booking engine?
          default: false
        priority:
          type: integer
          description: The priority of the extra
          format: int32
          default: 99
        displayOctoSite:
          type: boolean
          description: Is this extra visible on Octosite?
          default: false
        explode:
          type: boolean
          description: Whether explode or not the panel on BE
        vatExemption:
          type: string
          description: The Invoice Vat Exemption of the extra
          enum:
          - IT_ART15
          - IT_ITEM_EXCLUDED
          - IT_NO_VAT_4
          - IT_SPECIAL_GUEST
          - IT_REGIME_MARGINE
          - IT_REVERSE_CHANGE
          - IT_VAT_EU
          - IT_ITEM_EXCLUDED_N_2_2
          - IT_NO_VAT_1
          - IT_NO_VAT_2
          - IT_NO_VAT_3
          - IT_NO_VAT_5
          - IT_NO_VAT_6
          - IT_REVERSE_CHANGE_1
          - IT_REVERSE_CHANGE_2
          - IT_REVERSE_CHANGE_3
          - IT_REVERSE_CHANGE_4
          - IT_REVERSE_CHANGE_5
          - IT_REVERSE_CHANGE_6
          - IT_REVERSE_CHANGE_7
          - IT_REVERSE_CHANGE_8
          - IT_REVERSE_CHANGE_9
        vatExceptionDetail:
          type: string
          description: The Invoice Vat Exception detail of the extra
        unit:
          type: string
          description: The Product Unit of the extra
          enum:
          - KILOGRAM
          - GRAM
          - METER
          - KILOMETER
          - DECIMETER
          - MILLIMETER
          - LITRE
          - RATE
          - GIGABYTE
          - MEGABYTE
          - ROOM
          - WATT
          - KILOWATT
          - KILOWATT_HOUR
          - SECOND
          - MINUTE
          - HOUR
        availability:
          type: integer
          description: The availability of the extra
          format: int32
        displayOnRate:
          type: boolean
          description: Is this extra display on rate?
          default: false
        conditions:
          type: string
          description: The term conditions of the extra
        fiscalId:
          type: string
          description: The fiscal Id of the extra
        lastModifiedTime:
          type: string
          description: The last Modified time of the extras)
          format: date-time
          readOnly: true
        portalName:
          type: string
          description: The portal name of the extra
        photo:
          type: string
          description: The photo of the extra
        fiscalPrinterDepartmentId:
          type: integer
          description: The fiscal printer departments
          format: int64
          nullable: true
    ApiListingLight:
      type: object
      properties:
        name:
          type: string
          description: name of this room
          example: Double room
        id:
          type: integer
          description: The id of this product
          format: int64
          readOnly: true
      description: "Normally this product applies to all the rooms of the accommodation\
        \ (null).  If you want to use only for selected rooms, you can filter the\
        \ rooms to associate with the extra"
      nullable: true
    ApiRateDTO:
      type: object
      properties:
        id:
          type: integer
          description: The id of the rate plan
          format: int64
        internalLabel:
          type: string
          description: The internal label of the rate plan
        label:
          type: object
          additionalProperties:
            type: string
            description: The label map
          description: The label map
        title:
          type: object
          additionalProperties:
            type: string
            description: The title map
          description: The title map
        description:
          type: object
          additionalProperties:
            type: string
            description: The description map
          description: The description map
        treatment:
          type: string
          description: The treatment type
          enum:
          - ROOM_ONLY
          - BREAKFAST
          - HALF_BOARD
          - FULL_BOARD
          - FULL_BOARD_LIGHT
          - ALL_INCLUSIVE
          - OTHER
          - INSURANCE
          - NOT_REFUNDABLE
        accommodationId:
          type: string
          description: The property ID
        ratePlanDates:
          type: array
          description: The list of rate plan dates
          items:
            $ref: "#/components/schemas/ApiRatePlanDate"
        roomIds:
          type: array
          description: The list of room IDs
          items:
            type: integer
            description: The list of room IDs
            format: int64
        priceModel:
          type: string
          description: The price model
          enum:
          - PERCENT
          - FIXED
          - FIXED_PAX
          - FIXED_DAY
          - FIXED_PAX_DAY
        price:
          type: number
          description: The base price
        showPrices:
          type: boolean
          description: Whether to show prices
        paymentPolicy:
          $ref: "#/components/schemas/ApiPaymentStepDTO"
        cancellationPolicy:
          $ref: "#/components/schemas/ApiPaymentStepDTO"
        extras:
          type: array
          description: The list of extra product IDs
          items:
            $ref: "#/components/schemas/RatePlanExtraDTO"
        priority:
          type: integer
          description: The priority of the rate plan
          format: int32
        accommodationName:
          type: string
          description: The name of the accommodation
      description: "List of rateplans accepted by the Room. Used mainly in Booking\
        \ Engine only. For specific functionality of this field, try on the frontend\
        \ using also the booking engine. For Channel connectivity, you can ignore"
    ApiRatePlanDate:
      type: object
      properties:
        id:
          type: integer
          description: Unique identifier of this rate plan date
          format: int64
        startDate:
          type: string
          description: The start date in UTC
          format: date-time
        endDate:
          type: string
          description: The end date in UTC
          format: date-time
        ratePlanId:
          type: integer
          description: The rate plan id
          format: int64
      description: The list of rate plan dates
    RatePlanExtraDTO:
      type: object
      properties:
        id:
          type: integer
          description: Unique identifier of the RatePlanExtra
          format: int64
          example: 123
        ratePlanId:
          type: integer
          description: ID of the RatePlan associated with the extra
          format: int64
          example: 42
        productId:
          type: integer
          description: ID of the Product (extra)
          format: int64
          example: 88
        quantity:
          type: integer
          description: Quantity of the extra
          format: int32
          example: 2
        price:
          type: number
          description: Total price for the extra
          example: 15.0
        date:
          type: string
          description: Date when the extra is applied
          format: date
        createTime:
          type: string
          description: Creation time of the entry
          format: date-time
        mandatory:
          type: boolean
          description: Indicates whether the extra is mandatory
          example: true
        applyOnFirstDay:
          type: boolean
          description: Whether the extra is applied only on the first day
          example: false
        accommodationId:
          type: string
          description: Accommodation code to which the extra belongs
          example: ROME1234
      description: DTO for RatePlanExtra entity
    OAuthToken2:
      type: object
      properties:
        access_token:
          type: string
          description: This token have a short expiration. We expect that on network
            you normally transit this token.
        refresh_token:
          type: string
          description: The token that you should crypt and use the less possible.
            This token doesn't have an expiration
        expires_in:
          type: integer
          format: int64
        expireDate:
          type: string
          description: "DEPRECATED: Use expires_in. After that date, you should use\
            \ the refresh token to obtain a new access_token"
          format: date-time
          deprecated: true
        token_type:
          type: string
        accessToken:
          type: string
    GuestDTO:
      required:
      - id
      type: object
      properties:
        id:
          type: integer
          description: Reference inside our system
          format: int64
          readOnly: true
          example: 17
        category:
          type: string
          description: The category
          example: TRAVEL_AGENCY
          enum:
          - INDIVIDUAL
          - TRAVEL_AGENCY
          - CORPORATE
          - EXTERNAL_OTA
        type:
          type: string
          description: The type
          readOnly: true
          example: REAL
          enum:
          - REAL
          - JURIDICAL
        accommodationId:
          type: string
          description: The accommodation id
          readOnly: true
          example: "999999"
        firstname:
          type: string
          description: The firstname
          example: Mario
        lastname:
          type: string
          description: The lastname
          example: Rossi
        fullname:
          type: string
          description: A user friendly string to describe this guest
          readOnly: true
          example: Rossi Mario
        company:
          type: string
          description: The company
          readOnly: true
        fiscalCode:
          type: string
          description: The fiscal code
        vatCode:
          type: string
          description: The VAT code
        address:
          type: string
          description: The address
        city:
          type: string
          description: The city
        birthCountry:
          type: string
          description: The birth country
          enum:
          - AF
          - AX
          - AL
          - DZ
          - AS
          - AD
          - AO
          - AI
          - AQ
          - AG
          - AR
          - AM
          - AW
          - AU
          - AT
          - AZ
          - BS
          - BH
          - BD
          - BB
          - BY
          - BE
          - BZ
          - BJ
          - BM
          - BT
          - BO
          - BQ
          - BA
          - BW
          - BV
          - BR
          - IO
          - BN
          - BG
          - BF
          - BI
          - KH
          - CM
          - CA
          - CV
          - KY
          - CF
          - TD
          - CL
          - CN
          - CX
          - CC
          - CO
          - KM
          - CG
          - CD
          - CK
          - CR
          - CI
          - HR
          - CU
          - CW
          - CY
          - CZ
          - DK
          - DJ
          - DM
          - DO
          - EC
          - EG
          - SV
          - GQ
          - ER
          - EE
          - ET
          - FK
          - FO
          - FJ
          - FI
          - FR
          - GF
          - PF
          - TF
          - GA
          - GM
          - GE
          - DE
          - GH
          - GI
          - GR
          - GL
          - GD
          - GP
          - GU
          - GT
          - GG
          - GN
          - GW
          - GY
          - HT
          - HM
          - VA
          - HN
          - HK
          - HU
          - IS
          - IN
          - ID
          - IR
          - IQ
          - IE
          - IM
          - IL
          - IT
          - JM
          - JP
          - JE
          - JO
          - KZ
          - KE
          - KI
          - KP
          - KR
          - KW
          - KG
          - LA
          - LV
          - LB
          - LS
          - LR
          - LY
          - LI
          - LT
          - LU
          - MO
          - MK
          - MG
          - MW
          - MY
          - MV
          - ML
          - MT
          - MH
          - MQ
          - MR
          - MU
          - YT
          - MX
          - FM
          - MD
          - MC
          - MN
          - ME
          - MS
          - MA
          - MZ
          - MM
          - NA
          - NR
          - NP
          - NL
          - NC
          - NZ
          - NI
          - NE
          - NG
          - NU
          - NF
          - MP
          - "NO"
          - OM
          - PK
          - PW
          - PS
          - PA
          - PG
          - PY
          - PE
          - PH
          - PN
          - PL
          - PT
          - PR
          - QA
          - RE
          - RO
          - RU
          - RW
          - BL
          - SH
          - KN
          - LC
          - MF
          - PM
          - VC
          - WS
          - SM
          - ST
          - SA
          - SN
          - RS
          - SC
          - SL
          - SG
          - SX
          - SK
          - SI
          - SB
          - SO
          - ZA
          - GS
          - SS
          - ES
          - LK
          - SD
          - SR
          - SJ
          - SZ
          - SE
          - CH
          - SY
          - TW
          - TJ
          - TZ
          - TH
          - TL
          - TG
          - TK
          - TO
          - TT
          - TN
          - TR
          - TM
          - TC
          - TV
          - UG
          - UA
          - AE
          - GB
          - US
          - UM
          - UY
          - UZ
          - VU
          - VE
          - VN
          - VG
          - VI
          - WF
          - EH
          - YE
          - ZM
          - ZW
          - XJ
        birthCityRaw:
          type: string
          description: The birth city raw
          readOnly: true
        birthCityId:
          type: integer
          description: The birth city id
          format: int64
          readOnly: true
        zip:
          type: string
          description: The zip
        district:
          type: string
          description: The district
        sex:
          type: string
          description: The sex
          readOnly: true
          enum:
          - MALE
          - FEMALE
        mobile:
          type: string
          description: The mobile
          readOnly: true
        email:
          type: string
          description: The email
          readOnly: true
        documentId:
          type: string
          description: The document id
          readOnly: true
        documentIssuePlace:
          type: string
          description: The document issue place
          readOnly: true
        color:
          type: string
          description: The color
          readOnly: true
        country:
          type: string
          description: The country
          enum:
          - AF
          - AX
          - AL
          - DZ
          - AS
          - AD
          - AO
          - AI
          - AQ
          - AG
          - AR
          - AM
          - AW
          - AU
          - AT
          - AZ
          - BS
          - BH
          - BD
          - BB
          - BY
          - BE
          - BZ
          - BJ
          - BM
          - BT
          - BO
          - BQ
          - BA
          - BW
          - BV
          - BR
          - IO
          - BN
          - BG
          - BF
          - BI
          - KH
          - CM
          - CA
          - CV
          - KY
          - CF
          - TD
          - CL
          - CN
          - CX
          - CC
          - CO
          - KM
          - CG
          - CD
          - CK
          - CR
          - CI
          - HR
          - CU
          - CW
          - CY
          - CZ
          - DK
          - DJ
          - DM
          - DO
          - EC
          - EG
          - SV
          - GQ
          - ER
          - EE
          - ET
          - FK
          - FO
          - FJ
          - FI
          - FR
          - GF
          - PF
          - TF
          - GA
          - GM
          - GE
          - DE
          - GH
          - GI
          - GR
          - GL
          - GD
          - GP
          - GU
          - GT
          - GG
          - GN
          - GW
          - GY
          - HT
          - HM
          - VA
          - HN
          - HK
          - HU
          - IS
          - IN
          - ID
          - IR
          - IQ
          - IE
          - IM
          - IL
          - IT
          - JM
          - JP
          - JE
          - JO
          - KZ
          - KE
          - KI
          - KP
          - KR
          - KW
          - KG
          - LA
          - LV
          - LB
          - LS
          - LR
          - LY
          - LI
          - LT
          - LU
          - MO
          - MK
          - MG
          - MW
          - MY
          - MV
          - ML
          - MT
          - MH
          - MQ
          - MR
          - MU
          - YT
          - MX
          - FM
          - MD
          - MC
          - MN
          - ME
          - MS
          - MA
          - MZ
          - MM
          - NA
          - NR
          - NP
          - NL
          - NC
          - NZ
          - NI
          - NE
          - NG
          - NU
          - NF
          - MP
          - "NO"
          - OM
          - PK
          - PW
          - PS
          - PA
          - PG
          - PY
          - PE
          - PH
          - PN
          - PL
          - PT
          - PR
          - QA
          - RE
          - RO
          - RU
          - RW
          - BL
          - SH
          - KN
          - LC
          - MF
          - PM
          - VC
          - WS
          - SM
          - ST
          - SA
          - SN
          - RS
          - SC
          - SL
          - SG
          - SX
          - SK
          - SI
          - SB
          - SO
          - ZA
          - GS
          - SS
          - ES
          - LK
          - SD
          - SR
          - SJ
          - SZ
          - SE
          - CH
          - SY
          - TW
          - TJ
          - TZ
          - TH
          - TL
          - TG
          - TK
          - TO
          - TT
          - TN
          - TR
          - TM
          - TC
          - TV
          - UG
          - UA
          - AE
          - GB
          - US
          - UM
          - UY
          - UZ
          - VU
          - VE
          - VN
          - VG
          - VI
          - WF
          - EH
          - YE
          - ZM
          - ZW
          - XJ
        birthDate:
          type: string
          description: The birth date in UTC (ISO8601)
          format: date-time
          readOnly: true
        notes:
          type: string
          description: The notes
          readOnly: true
        birthPlace:
          type: string
          description: The birth place
          readOnly: true
        invoiceAgency:
          type: boolean
          readOnly: true
        destinationOffice:
          type: string
          description: The destination office
          readOnly: true
        legalMail:
          type: string
          description: The legal mail
          readOnly: true
        newsletterConcent:
          type: boolean
          description: true if newsletter enabled
          readOnly: true
        newsletterConcentIp:
          type: string
          description: The newsletter concent ip
          readOnly: true
        newsletterConcentDate:
          type: string
          description: The newsletter concent date in UTC (ISO8601)
          format: date-time
          readOnly: true
        documentCountry:
          type: string
          description: The document country
          readOnly: true
          enum:
          - AF
          - AX
          - AL
          - DZ
          - AS
          - AD
          - AO
          - AI
          - AQ
          - AG
          - AR
          - AM
          - AW
          - AU
          - AT
          - AZ
          - BS
          - BH
          - BD
          - BB
          - BY
          - BE
          - BZ
          - BJ
          - BM
          - BT
          - BO
          - BQ
          - BA
          - BW
          - BV
          - BR
          - IO
          - BN
          - BG
          - BF
          - BI
          - KH
          - CM
          - CA
          - CV
          - KY
          - CF
          - TD
          - CL
          - CN
          - CX
          - CC
          - CO
          - KM
          - CG
          - CD
          - CK
          - CR
          - CI
          - HR
          - CU
          - CW
          - CY
          - CZ
          - DK
          - DJ
          - DM
          - DO
          - EC
          - EG
          - SV
          - GQ
          - ER
          - EE
          - ET
          - FK
          - FO
          - FJ
          - FI
          - FR
          - GF
          - PF
          - TF
          - GA
          - GM
          - GE
          - DE
          - GH
          - GI
          - GR
          - GL
          - GD
          - GP
          - GU
          - GT
          - GG
          - GN
          - GW
          - GY
          - HT
          - HM
          - VA
          - HN
          - HK
          - HU
          - IS
          - IN
          - ID
          - IR
          - IQ
          - IE
          - IM
          - IL
          - IT
          - JM
          - JP
          - JE
          - JO
          - KZ
          - KE
          - KI
          - KP
          - KR
          - KW
          - KG
          - LA
          - LV
          - LB
          - LS
          - LR
          - LY
          - LI
          - LT
          - LU
          - MO
          - MK
          - MG
          - MW
          - MY
          - MV
          - ML
          - MT
          - MH
          - MQ
          - MR
          - MU
          - YT
          - MX
          - FM
          - MD
          - MC
          - MN
          - ME
          - MS
          - MA
          - MZ
          - MM
          - NA
          - NR
          - NP
          - NL
          - NC
          - NZ
          - NI
          - NE
          - NG
          - NU
          - NF
          - MP
          - "NO"
          - OM
          - PK
          - PW
          - PS
          - PA
          - PG
          - PY
          - PE
          - PH
          - PN
          - PL
          - PT
          - PR
          - QA
          - RE
          - RO
          - RU
          - RW
          - BL
          - SH
          - KN
          - LC
          - MF
          - PM
          - VC
          - WS
          - SM
          - ST
          - SA
          - SN
          - RS
          - SC
          - SL
          - SG
          - SX
          - SK
          - SI
          - SB
          - SO
          - ZA
          - GS
          - SS
          - ES
          - LK
          - SD
          - SR
          - SJ
          - SZ
          - SE
          - CH
          - SY
          - TW
          - TJ
          - TZ
          - TH
          - TL
          - TG
          - TK
          - TO
          - TT
          - TN
          - TR
          - TM
          - TC
          - TV
          - UG
          - UA
          - AE
          - GB
          - US
          - UM
          - UY
          - UZ
          - VU
          - VE
          - VN
          - VG
          - VI
          - WF
          - EH
          - YE
          - ZM
          - ZW
          - XJ
        documentExpire:
          type: string
          description: The document expire date in UTC (ISO8601)
          format: date-time
          readOnly: true
        suggestedPaymentMode:
          type: string
          description: The suggested payment mode
          readOnly: true
          enum:
          - UNKNOWN
          - CASH
          - CREDITCARD
          - PREPAID
          - BANKTRANSFER
          - NOTPAID
          - PAYPAL
          - CHEQUE
          - TRAVELCHEQUE
          - TREASURY_OFFICE
          - BONCADEAU
          - TREASURY_RECEIPT
          - COMMISSION
        paymentCondition:
          type: string
          description: The payment condition
          readOnly: true
          enum:
          - ONESHOT
          - PAYMENTS
          - COLLECT
          - RESERVATION
          - CHECKIN
          - MANUALLY
        excludeCommissions:
          type: boolean
          readOnly: true
        excludeCityTaxAgency:
          type: boolean
          readOnly: true
        excludeCityTax:
          type: boolean
          readOnly: true
        commission:
          type: number
          description: The commission
          readOnly: true
        commissionPolicy:
          type: string
          description: The commission policy
          readOnly: true
          enum:
          - ACCOMMODATION
          - TAXINCLUDED
          - TAXEXCLUDED
        invoiceTo:
          type: integer
          description: The invoice to
          format: int64
          readOnly: true
        language:
          type: string
          description: The language
          readOnly: true
          enum:
          - IT
          - EN
          - FR
          - ES
          - DE
          - RU
          - PT
          - NL
          - JA
          - EL
          - TR
          - ZH
          - CA
          - RO
        status:
          type: string
          description: The status
          readOnly: true
          enum:
          - VISIBLE
          - HIDDEN
          - DELETED
        documentTypeId:
          type: integer
          description: The police document type id
          format: int64
          readOnly: true
        reservationGuestCategoryId:
          type: integer
          description: The reservation guest category id
          format: int64
          readOnly: true
        reservationGuestReferId:
          type: integer
          description: The reservation guest refer id
          format: int64
          readOnly: true
        ratePlanId:
          type: integer
          description: The rate plan id
          format: int64
          readOnly: true
        externalGuestId:
          type: integer
          description: The external guest id
          format: int64
          readOnly: true
        manageCommissionPaymentOta:
          type: boolean
          description: whether the commission is always included as payment
          readOnly: true
    ApiError:
      type: object
      properties:
        message:
          type: string
          description: That's the detailed message we can provide you to describe
            what's when wrong. If you provide the 'Accept-Language' header we will
            try to translate it for you (useful i.e. in content)
          example: "Internal error: No enum constant Country.EN'"
        type:
          type: string
          description: That's the most interesting field to generally understand the
            error other than the http response code. It helps to understand the category
            of the error
          example: ApiParamsExemption
        machine_name:
          type: string
          description: "If available, a manually added (so don't use it as direct\
            \ pointer) reference, to where the wrong field in json it's located, or\
            \ where you should look the error"
        human_name:
          type: string
          description: That's helps you to rapid understand what's going wrong
          example: Invalid Json
        element:
          type: string
          description: "The element that's causing the issue. I.e. if you're looking\
            \ for a Reservation and it doesn't exists, might be that"
          example: Reservation
        suggestion:
          type: string
          description: If available (more likely in the content) the suggested action
            to fix the issue
        nested:
          type: array
          description: List of errors that depends on this (i.e this might be an Invalid
            Params error and in nested you can find all the discarded params)
          items:
            $ref: "#/components/schemas/ApiError"
    ApiExtraDetailDTO:
      required:
      - product
      type: object
      properties:
        id:
          type: integer
          description: Id of the extra. Read only
          format: int64
          readOnly: true
          example: 12312
        product:
          type: integer
          description: Id of the extra product
          format: int64
          example: 12312
        price:
          maximum: 99999999.99
          minimum: 0
          type: number
          description: Price for this item. This is not the calculated value. Set
            NULL to let octorate calculate it
          nullable: true
          example: 12.22
        quantity:
          type: integer
          description: How many of this extra?
          format: int32
          default: 1
        day:
          type: string
          description: The date where this extra applies
          format: date
          nullable: true
          example: 2020-02-01
        url:
          maximum: 255
          type: string
          description: "A link that can be used to retrieve some information about\
            \ this extra (i.e. invoicing, login inside you site,etc..)"
        externalId:
          type: string
          description: Your reference for this Extra
        createDate:
          type: string
          description: time where this extra was created
          format: date-time
        productionDate:
          type: string
          description: time where this extra was consumed
          format: date-time
        invoiced:
          type: boolean
          description: Has this extra been invoiced?
          readOnly: true
        group:
          type: boolean
          description: Group not group
        manual:
          type: boolean
          description: "True if added manually, false if added by rate plan"
        localDay:
          type: string
          format: date
    ApiExtras:
      type: object
      properties:
        extras:
          type: array
          items:
            $ref: "#/components/schemas/ApiExtraDetailDTO"
    ApiBulkReservation:
      type: object
      properties:
        reservations:
          type: array
          items:
            $ref: "#/components/schemas/ApiReservationReqDTO"
    ApiReservationReqDTO:
      required:
      - channelId
      - checkin
      - checkout
      - createTime
      - guests
      - product
      - refer
      - roomGross
      - totalChildren
      - totalGuest
      - totalInfants
      - updateTime
      type: object
      properties:
        status:
          type: string
          description: Status of the reservation
          example: CONFIRMED
          enum:
          - CANCELLED
          - WAITING
          - CONFIRMED
        refer:
          maximum: 25
          type: string
          description: "Unique refer of a group of reservations for your system, the\
            \ channel or octorate"
          readOnly: true
          example: A2DD123_AA2211
        guests:
          type: array
          description: Guests of the reservation
          items:
            $ref: "#/components/schemas/ApiReservationGuestDTO"
        privateNotes:
          type: string
          description: Internal Notes
          example: "Customer says is not sure whether will arrive on 25th or 26th\
            \ of March, Payment was agreed but not yet arrived"
        roomCode:
          $ref: "#/components/schemas/ApiReservationRoomCodeDTO"
        channelRefer:
          type: string
          description: The refer assigned in the external portal.
          readOnly: true
          example: A12FF232DDDDDD
        channelId:
          type: integer
          description: Octorate ID for the portal
          format: int64
          example: 212
        product:
          type: integer
          description: The product to be associated with this reservation. i.e. 'Double
            Room Not Ref.'
          format: int64
          example: 1222222
        pmsProduct:
          type: integer
          description: The PMS room assigned. i.e. the 102 of the product 'Double
            Room'
          format: int64
          example: 1200122
        checkin:
          type: string
          description: "Exact date (and time) the guest is expected to came in the\
            \ accommodation. Date is in UTC, ISO format. Check accommodation timezone\
            \ for conversion."
          format: date-time
          example: 2019-12-10T11:03:00Z
          externalDocs:
            url: https://www.iso.org/iso-8601-date-and-time-format.html
        checkout:
          type: string
          description: "Exact Date (and time) the guest  is expected to came leave\
            \ the accommodation. Date is in UTC, ISO format. Check accommodation timezone\
            \ for conversion. i.e. guests arrives on 2020-07-18 at 13.00 HST time\
            \ (UTC -10), here you will have 2020-07-18 at 23:00"
          format: date-time
          example: 2019-12-15T11:03:00Z
          externalDocs:
            url: https://www.iso.org/iso-8601-date-and-time-format.html
        effectiveCheckin:
          type: string
          description: "Exact date (and time) the guest has been presented to the\
            \ receptionist for document related checkin. Date is in UTC, ISO format.\
            \ Check accommodation timezone for conversion."
          format: date-time
          example: 2019-12-10T11:03:00Z
          externalDocs:
            url: https://www.iso.org/iso-8601-date-and-time-format.html
        effectiveCheckout:
          type: string
          description: "Exact date (and time) the guest has leaved the accommodation\
            \ and has given back the keys. Date is in UTC, ISO format. Check accommodation\
            \ timezone for conversion."
          format: date-time
          example: 2019-12-10T11:03:00Z
          externalDocs:
            url: https://www.iso.org/iso-8601-date-and-time-format.html
        createTime:
          type: string
          description: "Exact Date (and time) when the reservation was created. Date\
            \ is in UTC, ISO format. No related to the accommodation take as it is"
          format: date-time
          example: 2019-12-09T11:03:00Z
          externalDocs:
            url: https://www.iso.org/iso-8601-date-and-time-format.html
        updateTime:
          type: string
          description: "Last date and time the reservation was updated. Date is in\
            \ UTC, ISO format. No related to the accommodation take as it is"
          format: date-time
          example: 2019-12-17T11:03:00Z
          externalDocs:
            url: https://www.iso.org/iso-8601-date-and-time-format.html
        roomGross:
          type: number
          description: Price gross of the room only. USE THIS AND SET NULL GROSS PRICE
            IF YOU HANDLE EXTRAS SEPARATELY.
          example: 47.56
        totalGuest:
          type: integer
          description: Total guests of the reservation
          format: int32
          default: 0
        totalChildren:
          type: integer
          description: Total children of the reservation
          format: int32
          default: 0
        totalInfants:
          type: integer
          description: Total infants of the reservation
          format: int32
          default: 0
        channelNotes:
          type: string
          description: Notes from the portal
          example: Reservation payment facilitated through a virtual card
        metaData:
          type: array
          description: Some custom fields that can be shown to the hotel or the guest
          items:
            $ref: "#/components/schemas/ApiReservationMetadataDTO"
        guest:
          $ref: "#/components/schemas/ReservationStreamGuest"
        externalRefer:
          type: string
        reservationExternal:
          $ref: "#/components/schemas/ReservationExternal"
        api:
          type: boolean
        zip:
          type: string
        totalPaid:
          type: number
        cleaningFee:
          type: number
        place:
          $ref: "#/components/schemas/Place"
        city:
          type: string
        address:
          type: string
        country:
          type: string
        cityTaxExemption:
          type: string
          enum:
          - TOO_YOUNG_RANGE2
          - HOSPITALISED
          - POLICE
          - DRIVER
          - TURIST_GUIDE
          - LONG_STAY
          - STUDY_RELATED
          - FESTIVALS
          - OTHER
          - HANDICAPPED
          - RESIDENCE_REASON
          - LOW_SEASON
          - EMERGENCY
          - HOSPITAL_HELPER
          - TOO_OLD
          - DISABLED_HELPER
          - HOTEL_WORKERS
          - EXEMPTION_WORKERS
          - FREQUENT_GUEST
          - WANT_NOT_PAY
          - PORTAL_PAID
          - TOO_YOUNG_RANGE1
          - WORK_STAY
          - SPIRITUAL_RETREAT
          - PET_CARE
          - INTERNATIONAL_PROTECTION
          - SEPARATED_PARENT
          - FAMILY_CAREGIVER
          - GENDER_VIOLENCE
          - PATIENT_PARENT
        cityTaxPrice:
          type: number
        draft:
          type: boolean
        validated:
          type: boolean
        validatedDate:
          type: string
          format: date-time
        internalId:
          type: integer
          format: int64
        externalId:
          type: string
        systemGenerated:
          type: boolean
        taxIncluded:
          type: boolean
        notRefundable:
          type: boolean
        loyaltyDiscount:
          type: boolean
        externalDiscountId:
          type: string
        extraIncluded:
          type: array
          items:
            $ref: "#/components/schemas/ReservationStreamExtra"
        internalRate:
          type: integer
          format: int64
        cityTaxAmountInPayment:
          type: number
        companyCollect:
          type: string
          enum:
          - NONE
          - COMPANY
          - HOTEl
        daily:
          type: array
          items:
            $ref: "#/components/schemas/ReservationStreamDay"
        json:
          type: object
          additionalProperties:
            type: object
        streamFromAccommodation:
          type: boolean
        related:
          type: array
          items:
            $ref: "#/components/schemas/ReservationStream"
        streamCard:
          $ref: "#/components/schemas/ReservationStreamCard"
        cityTaxZero:
          type: boolean
        propertyReference:
          type: string
        octorateId:
          type: integer
          format: int64
        pushImportId:
          type: integer
          format: int64
        cancelPenality:
          type: number
        paymentMode:
          type: string
          enum:
          - UNKNOWN
          - CASH
          - CREDITCARD
          - PREPAID
          - BANKTRANSFER
          - NOTPAID
          - PAYPAL
          - CHEQUE
          - TRAVELCHEQUE
          - TREASURY_OFFICE
          - BONCADEAU
          - TREASURY_RECEIPT
          - COMMISSION
        connectionId:
          type: integer
          format: int64
        count:
          type: integer
          format: int32
        currency:
          type: object
          properties:
            currencyCode:
              type: string
            numericCode:
              type: integer
              format: int32
            numericCodeAsString:
              type: string
            displayName:
              type: string
            symbol:
              type: string
            defaultFractionDigits:
              type: integer
              format: int32
        extra:
          type: array
          items:
            $ref: "#/components/schemas/ReservationStreamExtra"
        groupName:
          type: string
        ratePlanId:
          type: integer
          format: int64
        paymentExpiration:
          type: string
          format: date-time
        ratePlanVariation:
          type: number
        houseKeepingNotes:
          type: string
        tagLabel:
          type: integer
          format: int64
        agencyId:
          type: integer
          format: int64
        invoiceHolderId:
          type: integer
          format: int64
        noteTime:
          type: boolean
        purpose:
          type: string
          enum:
          - "0"
          - "1"
          - "2"
          - "3"
          - "4"
          - "5"
        roomLocked:
          type: boolean
        checkinClerk:
          type: integer
          format: int64
        checkoutClerk:
          type: integer
          format: int64
        housekeeperClerk:
          type: integer
          format: int64
        deposit:
          type: number
        technicalCreditCardChange:
          type: boolean
        reservationSplitStream:
          $ref: "#/components/schemas/ReservationSplitStream"
        groupNotes:
          type: string
        flight:
          type: string
        policeGuests:
          type: array
          items:
            $ref: "#/components/schemas/ReservationStreamPoliceGuest"
        color:
          type: string
        groupId:
          type: integer
          format: int64
        completed:
          type: boolean
    SearchRoomDiscount:
      type: object
      properties:
        id:
          type: integer
          format: int64
        name:
          type: string
        value:
          type: number
        description:
          type: string
        netRate:
          type: number
        isPercent:
          type: boolean
        bookingFee:
          type: number
        hotelFee:
          type: number
        resortFee:
          type: number
        serviceCharge:
          type: number
        local_tax:
          type: number
        vat:
          type: number
        final_rate:
          type: number
      description: Discount applied
    SearchRoomResult:
      type: object
      properties:
        room:
          type: integer
          description: Product/Rate ID
          format: int64
        rate:
          type: integer
          description: Rate Id for BE Only
          format: int64
        visibleBe:
          type: boolean
          description: Visible on Booking Engine
        name:
          type: string
          description: Offer Name
        ratePlanName:
          type: string
          description: Rate Plan Name
        checkin:
          type: string
          description: Checkin Date
        checkout:
          type: string
          description: Checkout Date
        bookUrl:
          type: string
          description: Booking url
        price:
          type: number
          description: Final price
        availability:
          type: integer
          description: Current availability
          format: int32
        guests:
          type: integer
          description: Number of guests
          format: int32
        discount:
          $ref: "#/components/schemas/SearchRoomDiscount"
        bookingFee:
          type: number
          description: The booking fee
        peopleFee:
          type: number
          description: The fees that depends on how many guest book
        otherFee:
          type: number
          description: The fees that do not depends on previous criteria
        dayFee:
          type: number
        hotelFee:
          type: number
          description: The hotel fee
        resortFee:
          type: number
        serviceCharge:
          type: number
        breakfastPrice:
          type: number
        cleaningPrice:
          type: number
        localTax:
          type: number
        vat:
          type: number
        netRate:
          type: number
          description: Price of the room without taxes
        basePrice:
          type: number
          description: Base price of the room (without extras)
        mealCode:
          type: string
        freeCancellation:
          type: boolean
        paymentType:
          type: string
          description: Returns if user is allowed to pay in place.
        currency:
          type: string
        roomsLeft:
          type: integer
          format: int32
        breakfastIncluded:
          type: boolean
        isVatIncluded:
          type: boolean
          description: Indicates if VAT is included in the price
        minDeposit:
          type: number
        cancellationValue:
          type: number
        cancellationPolicy:
          type: string
        cancellationFreeDays:
          type: integer
          format: int32
        bookable:
          type: boolean
        notBookableReason:
          type: string
          description: "Not bookable reason, so the reason why the result has avail\
            \ zero or is not bookable"
        minStay:
          type: integer
          description: "Min stay expected, if not bookable"
          format: int32
        maxStay:
          type: integer
          description: "Max stay expected, if not bookable"
          format: int32
    CalendarBulkRequest:
      type: object
      properties:
        room:
          type: integer
          description: The Octorate's room id to update.
          format: int64
        dateFrom:
          type: string
          description: The first date to change in calendar (inclusive). Date must
            be in format yyyy-mm-dd.
          format: date
        dateTo:
          type: string
          description: The last date to change in calendar (inclusive). Date must
            be in format yyyy-mm-dd.
          format: date
        values:
          $ref: "#/components/schemas/CalendarBulkValues"
    CalendarBulkValues:
      type: object
      properties:
        availability:
          type: integer
          format: int32
        price:
          type: number
        minstay:
          type: integer
          format: int32
        maxstay:
          type: integer
          format: int32
        stopSells:
          type: boolean
        closeToArrival:
          type: boolean
        closeToDeparture:
          type: boolean
        cutOffDays:
          type: integer
          format: int32
    ApiCalendarDay:
      type: object
      properties:
        date:
          type: string
          description: Date of reference
          format: date
        availability:
          type: integer
          description: availability value
          format: int32
        closeToArrival:
          type: boolean
          description: This day is close on arrival
        bookable:
          type: boolean
          description: If true means that this day is bookable
        closeToDeparture:
          type: boolean
          description: This day is close on departure
        price:
          type: number
        stopSells:
          type: boolean
          description: Stop selling on external channels
        minStay:
          type: integer
          description: Minimum stay
          format: int32
        maxStay:
          type: integer
          description: Maximum stay
          format: int32
        cutOffDays:
          type: integer
          format: int32
        object:
          type: string
      description: List of daily values
    ApiCalendarRoom:
      type: object
      properties:
        id:
          type: integer
          format: int64
        name:
          type: string
        days:
          type: object
          properties:
            date:
              type: string
              description: Date of reference
              format: date
            availability:
              type: integer
              description: availability value
              format: int32
            closeToArrival:
              type: boolean
              description: This day is close on arrival
            bookable:
              type: boolean
              description: If true means that this day is bookable
            closeToDeparture:
              type: boolean
              description: This day is close on departure
            price:
              type: number
            stopSells:
              type: boolean
              description: Stop selling on external channels
            minStay:
              type: integer
              description: Minimum stay
              format: int32
            maxStay:
              type: integer
              description: Maximum stay
              format: int32
            cutOffDays:
              type: integer
              format: int32
            object:
              type: string
          description: List of daily values
        object:
          type: string
    ExternalDescriptions:
      type: object
      properties:
        directions:
          type: string
          example: "Follow the A12 motorway and exit to the first exist, our house\
            \ is on the left side"
        description:
          type: object
          properties:
            emptyValues:
              type: boolean
            empty:
              type: boolean
          additionalProperties:
            type: string
            example: "{\"EN\":\"These are the LanguageMap value in English!\"}"
            default: "{\"EN\":\"These are the access rule in English!\"}"
          example:
            EN: These are the LanguageMap value in English!
          default:
            EN: These are the access rule in English!
        houseRules:
          $ref: "#/components/schemas/LanguageMap"
        spaceInformation:
          $ref: "#/components/schemas/LanguageMap"
        access:
          $ref: "#/components/schemas/LanguageMap"
        hostInteraction:
          $ref: "#/components/schemas/LanguageMap"
        neightboorHood:
          $ref: "#/components/schemas/LanguageMap"
        transportation:
          $ref: "#/components/schemas/LanguageMap"
        details:
          $ref: "#/components/schemas/LanguageMap"
        paymentNotes:
          $ref: "#/components/schemas/LanguageMap"
        headline:
          $ref: "#/components/schemas/PortalLanguageMap"
    PortalLanguageMap:
      type: object
      properties:
        fallback:
          $ref: "#/components/schemas/LanguageMap"
        values:
          type: object
          additionalProperties:
            $ref: "#/components/schemas/LanguageMap"
        currentSelector:
          $ref: "#/components/schemas/PortalNames"
        portalValues:
          type: object
          additionalProperties:
            $ref: "#/components/schemas/LanguageMap"
        currentValue:
          $ref: "#/components/schemas/LanguageMap"
      example:
        fallback:
          EN: This is the LanguageMap value in English! It's used when a portal value
            is not available
        values:
          AIRBNB:
            IT: This is a value in italian!
          HOMEAWAY:
            ES: This is a value in Spanish!
          BOOKING:
            EN: This is a value for a LanguageMap  in English!
            IT: This is a value in italian!
    ExternalAvailabilityConf:
      type: object
      properties:
        airbnbCheckinCategory:
          type: string
          description: "The type of checkin (i.e. with doorman, with key, etc...)"
          enum:
          - doorman_entry
          - lockbox
          - smartlock
          - keypad
          - host_checkin
          - other_checkin
        checkinInstruction:
          type: string
          description: Checkin information for the customer
        advancedNotice:
          type: integer
          description: Minimum time required to book (in hours)
          format: int32
        defaultMinStay:
          type: integer
          description: default value for minimum stay
          format: int32
        defaultMaxStay:
          type: integer
          description: default value for maximum stay
          format: int32
        weekDayCheckin:
          type: array
          description: default week days checkin is allowed
          items:
            type: string
            description: default week days checkin is allowed
            enum:
            - MONDAY
            - TUESDAY
            - WEDNESDAY
            - THURSDAY
            - FRIDAY
            - SATURDAY
            - SUNDAY
        weekDayCheckout:
          type: array
          description: default week days checkout is allowed
          items:
            type: string
            description: default week days checkout is allowed
            enum:
            - MONDAY
            - TUESDAY
            - WEDNESDAY
            - THURSDAY
            - FRIDAY
            - SATURDAY
            - SUNDAY
        allowRTBMaxstay:
          type: boolean
          description: "RTB stands for \"Request To Book\", which is essentially bookings\
            \ upon request. Here you can enable the RTB (if the portal support this\
            \ behavior) after the minstay "
    ExternalFee:
      required:
      - portalValue
      type: object
      properties:
        portal:
          $ref: "#/components/schemas/PortalNames"
        portalValue:
          type: string
          example: "Airbnb {PASS_THROUGH_LINEN_FEE, PASS_THROUGH_COMMUNITY_FEE,PASS_THROUGH_MANAGEMENT_FEE,\
            \ PASS_THROUGH_RESORT_FEE}"
        chargeTypeValue:
          type: string
        amount:
          type: number
          format: double
        configuration:
          type: string
          description: Whether this fee is included or not in the basic configuration
            (available vs included)
          enum:
          - INCLUSIVE
          - EXCLUSIVE
        category:
          type: string
          description: The category of this fee
          enum:
          - FEE
          - TAX
        taxable:
          type: boolean
          description: Whether this element is taxable or not. Supported by Expedia
        internetDetails:
          $ref: "#/components/schemas/ExternalFeeInternet"
        parkingDetails:
          $ref: "#/components/schemas/ExternalFeeParking"
        propertyCharge:
          $ref: "#/components/schemas/OctoratePropertyCharge"
        airbnbFeeType:
          type: string
          enum:
          - PASS_THROUGH_RESORT_FEE
          - PASS_THROUGH_MANAGEMENT_FEE
          - PASS_THROUGH_COMMUNITY_FEE
          - PASS_THROUGH_LINEN_FEE
          - PASS_THROUGH_ELECTRICITY_FEE
          - PASS_THROUGH_WATER_FEE
          - PASS_THROUGH_HEATING_FEE
          - PASS_THROUGH_AIR_CONDITIONING_FEE
          - PASS_THROUGH_UTILITY_FEE
          - PASS_THROUGH_PET_FEE
          - PASS_THROUGH_CLEANING_FEE
          - PASS_THROUGH_SHORT_TERM_CLEANING_FEE
          - PASS_THROUGH_SECURITY_DEPOSIT
        inclusive:
          type: boolean
        codeType:
          type: string
          readOnly: true
          enum:
          - FEE_PERSONAL
          - CHARGE_TYPE
          - IMAGE_TAGS
          - SERVICE
          - PAYMENTS_CARD
          - LANGUAGES
          - BREAKFAST
          - CANCEL_POLICY
          - ROOM_AMENITY
          - INTERNET_CONNECTION_TYPES
          - INTERNET_CONNECTION_COVERAGE
          - PARKING_TYPE
          - BED_TYPE
          - CONTACT_TYPE
          - CONTACT_LANGUAGE
          - EXTRABED_GUEST_TYPE
          - BOOKING_ACCEPTED_GUESTS
          - FEE_TAX
          - RATE_OFFER
          - PRODUCT_BENEFIT
          - ACCOMMODATION_CATEGORY
          - CITY_TAX_CATEGORY
          - CITY_TAX_NATURE
          - CANCEL_POLICY_DEPOSIT
          - ROOM_CATEGORY
          - ROOM_CLASS
          - BEDROOM_TYPE
          - ROOM_NAMING
          - PHOTO_TYPE
          - LISTING_EXPECTATION
          - PROPERTY_CHECKIN_METHOD
          - BATHROOM_LOCATION
        editable:
          type: boolean
        internetFee:
          type: boolean
        parkingFee:
          type: boolean
        deletable:
          type: boolean
    ExternalFeeInternet:
      type: object
      properties:
        internetType:
          $ref: "#/components/schemas/ContentCodeMapping"
        internetCoverage:
          $ref: "#/components/schemas/ContentCodeMapping"
      description: Description for the internet fee
    ExternalFeeParking:
      type: object
      properties:
        needReservation:
          type: boolean
        publicArea:
          type: boolean
        parkingType:
          $ref: "#/components/schemas/ContentCodeMapping"
      description: Parking details
    ExternalListing:
      required:
      - airbnbPropertyType
      - bathroomShared
      - bathrooms
      - bedrooms
      - beds
      - country
      - floor
      - personCapacity
      - place
      - quantity
      - size
      type: object
      properties:
        reference:
          $ref: "#/components/schemas/PortalCustomItemString"
        externalUrl:
          type: object
          additionalProperties:
            type: string
            description: External Address of this room/property
            readOnly: true
          description: External Address of this room/property
          readOnly: true
        lastEdit:
          type: string
          description: Last edit time of this listing for the portals that requires
            this information
          format: date-time
          readOnly: true
        homewayList:
          type: boolean
          description: "If true, this listing is actually actived on Homeaway portal"
          readOnly: true
        airbnbPropertyGroup:
          type: string
          description: Main Category of this listing
          enum:
          - apartments
          - bnb
          - boutique_hotels_and_more
          - houses
          - secondary_units
          - unique_homes
        airbnbApprovalStatus:
          type: string
          description: Rappresent the status of this property for Airbnb (i.e. Waiting
            for approval from Airbnb)
          readOnly: true
          enum:
          - NEW
          - READY_FOR_REVIEW
          - APPROVED
          - REJECTED
        airbnbPropertyType:
          type: string
          description: Specific type of the property
          enum:
          - aparthotel
          - apartment
          - barn
          - bnb
          - boat
          - boutique_hotel
          - bungalow
          - cabin
          - campsite
          - casa_particular
          - castle
          - cave
          - chalet
          - condominium
          - cottage
          - cycladic_house
          - dammuso
          - dome_house
          - earthhouse
          - farm_stay
          - guest_suite
          - heritage_hotel
          - guesthouse
          - hostel
          - hotel
          - house
          - houseboat
          - hut
          - igloo
          - island
          - lighthouse
          - lodge
          - loft
          - minsu
          - pension
          - plane
          - resort
          - rv
          - ryokan
          - serviced_apartment
          - shepherds_hut
          - tent
          - tiny_house
          - tipi
          - townhouse
          - train
          - treehouse
          - trullo
          - villa
          - windmill
          - yurt
        roomTypeCategory:
          type: string
          description: Enum that describes the value of the room type. This generally
            gives an info about the octorate value.
          enum:
          - Apartment
          - Quadruple
          - Suite
          - Triple
          - Twin
          - Double
          - Single
          - Studio
          - Family
          - Dormitory_room
          - Bed_in_Dormitory
          - Bungalow
          - Chalet
          - Holiday_home
          - Villa
          - Mobile_home
          - Tent
          - Cabin
          - Condo
          - Cottage
          - Double_Or_Twin
          - Double_Room_Single_Use
          - Duplex
          - Loft
          - Townhome
          - TreeHouse
        roomClass:
          type: string
          description: Enumeration that describes the Octorate Room Classes. These
            elements may be translated in portal equivalent i.e. for generating the
            room name
          enum:
          - BASIC
          - BUSINESS
          - CITY
          - CLASSIC
          - CLUB
          - COMFORT
          - DELUXE
          - DESIGN
          - ECONOMY
          - ELITE
          - EXCLUSIVE
          - EXECUTIVE
          - FAMILY
          - GALLERY
          - GRAND
          - HONEYMOON
          - JUNIOR
          - LUXURY
          - PANORAMIC
          - PREMIER
          - PREMIUM
          - PRESIDENTIAL
          - ROMANTIC
          - SENIOR
          - SIGNATURE
          - STANDARD
          - SUPERIOR
          - TRADITIONAL
        bedroomType:
          type: string
          description: Enumeration that define what kind of bedroom this room has.
            Usually this element is used to generate a room name for some portals
          enum:
          - BEDROOM_1
          - BEDROOM_2
          - BEDROOM_3
          - BEDROOM_4
          - BEDROOM_5
          - BEDROOM_6
          - BEDROOM_N
          - BEDROOM_MAN
          - BEDROOM_MIXED
          - BEDROOM_WOMEN
        quantity:
          type: integer
          description: Default Quantity available for this listing (if supported)
          format: int32
        internalName:
          type: string
          description: Internal name of this listing
          readOnly: true
        bathrooms:
          type: number
          description: How many bathrooms are inside?
          format: double
        bedrooms:
          type: number
          description: How many bedrooms are inside?
          format: double
        beds:
          type: integer
          description: How many beds are inside?
          format: int32
        taxId:
          type: string
          description: Tax permission to operate in the country / area
        place:
          $ref: "#/components/schemas/PlaceInterface"
        personCapacity:
          type: integer
          description: Person capacity of this listing
          format: int32
        bathroomShared:
          type: boolean
          description: Boolean that means if the bathroom is shared. DEPRECATED. Use
            the privateSpace inside each room
          deprecated: true
        bathroomWith:
          type: array
          items:
            type: string
            enum:
            - host
            - family_friends_roommates
            - other_guests
        country:
          type: string
          description: ISO Code of the area where this listing operates
          enum:
          - AF
          - AX
          - AL
          - DZ
          - AS
          - AD
          - AO
          - AI
          - AQ
          - AG
          - AR
          - AM
          - AW
          - AU
          - AT
          - AZ
          - BS
          - BH
          - BD
          - BB
          - BY
          - BE
          - BZ
          - BJ
          - BM
          - BT
          - BO
          - BQ
          - BA
          - BW
          - BV
          - BR
          - IO
          - BN
          - BG
          - BF
          - BI
          - KH
          - CM
          - CA
          - CV
          - KY
          - CF
          - TD
          - CL
          - CN
          - CX
          - CC
          - CO
          - KM
          - CG
          - CD
          - CK
          - CR
          - CI
          - HR
          - CU
          - CW
          - CY
          - CZ
          - DK
          - DJ
          - DM
          - DO
          - EC
          - EG
          - SV
          - GQ
          - ER
          - EE
          - ET
          - FK
          - FO
          - FJ
          - FI
          - FR
          - GF
          - PF
          - TF
          - GA
          - GM
          - GE
          - DE
          - GH
          - GI
          - GR
          - GL
          - GD
          - GP
          - GU
          - GT
          - GG
          - GN
          - GW
          - GY
          - HT
          - HM
          - VA
          - HN
          - HK
          - HU
          - IS
          - IN
          - ID
          - IR
          - IQ
          - IE
          - IM
          - IL
          - IT
          - JM
          - JP
          - JE
          - JO
          - KZ
          - KE
          - KI
          - KP
          - KR
          - KW
          - KG
          - LA
          - LV
          - LB
          - LS
          - LR
          - LY
          - LI
          - LT
          - LU
          - MO
          - MK
          - MG
          - MW
          - MY
          - MV
          - ML
          - MT
          - MH
          - MQ
          - MR
          - MU
          - YT
          - MX
          - FM
          - MD
          - MC
          - MN
          - ME
          - MS
          - MA
          - MZ
          - MM
          - NA
          - NR
          - NP
          - NL
          - NC
          - NZ
          - NI
          - NE
          - NG
          - NU
          - NF
          - MP
          - "NO"
          - OM
          - PK
          - PW
          - PS
          - PA
          - PG
          - PY
          - PE
          - PH
          - PN
          - PL
          - PT
          - PR
          - QA
          - RE
          - RO
          - RU
          - RW
          - BL
          - SH
          - KN
          - LC
          - MF
          - PM
          - VC
          - WS
          - SM
          - ST
          - SA
          - SN
          - RS
          - SC
          - SL
          - SG
          - SX
          - SK
          - SI
          - SB
          - SO
          - ZA
          - GS
          - SS
          - ES
          - LK
          - SD
          - SR
          - SJ
          - SZ
          - SE
          - CH
          - SY
          - TW
          - TJ
          - TZ
          - TH
          - TL
          - TG
          - TK
          - TO
          - TT
          - TN
          - TR
          - TM
          - TC
          - TV
          - UG
          - UA
          - AE
          - GB
          - US
          - UM
          - UY
          - UZ
          - VU
          - VE
          - VN
          - VG
          - VI
          - WF
          - EH
          - YE
          - ZM
          - ZW
          - XJ
        size:
          type: number
          description: Size of the appartament in meters squared
          format: double
        floor:
          type: integer
          description: At which floor is located the apartment?
          format: int32
        externalTask:
          type: array
          items:
            $ref: "#/components/schemas/ExternalTask"
        bookingPropertyGroup:
          type: string
          enum:
          - Apartment
          - Quadruple
          - Suite
          - Triple
          - Twin
          - Double
          - Single
          - Studio
          - Family
          - Dormitory_room
          - Bed_in_Dormitory
          - Bungalow
          - Chalet
          - Holiday_home
          - Villa
          - Mobile_home
          - Tent
          - Cabin
          - Condo
          - Cottage
          - Double_Or_Twin
          - Double_Room_Single_Use
          - Duplex
          - Loft
          - Townhome
          - TreeHouse
        airbnbRoomType:
          type: string
          enum:
          - private_room
          - shared_room
          - entire_home
        airbnbEntireHome:
          type: boolean
        bookingHasRoom:
          type: boolean
    ExternalTask:
      type: object
      properties:
        type:
          type: string
          enum:
          - RETURN_KEYS
          - TURN_THINGS_OFF
          - THROW_TRASH
          - LOCK_UP
          - GATHER_TOWELS
          - ADDITIONAL_REQUESTS
        taskDetail:
          type: string
        present:
          type: boolean
    PortalCustomItemString:
      type: object
      properties:
        values:
          type: object
          properties:
            empty:
              type: boolean
          additionalProperties:
            type: string
          writeOnly: true
        fallback:
          type: string
          writeOnly: true
        portalValues:
          type: object
          properties:
            empty:
              type: boolean
          additionalProperties:
            type: string
    PortalMapStringString:
      type: object
      properties:
        empty:
          type: boolean
      additionalProperties:
        type: string
    ExternalDiscount:
      type: object
      properties:
        model:
          type: string
          enum:
          - BOOKED_BEYOND_AT_LEAST_X_DAYS
          - BOOKED_WITHIN_AT_MOST_X_DAYS
          - STAYED_AT_LEAST_X_DAYS
        type:
          type: string
          enum:
          - FIXED
          - PERCENT
        value:
          type: number
        daysThresholdOne:
          type: integer
          format: int32
      description: "Currently supported by: [AIRBNB]. These are discounts that will\
        \ be applied without consider the period of the booking (So are fixed). They\
        \ may impact last minute discounts or early bid discounts"
    ExternalPricing:
      type: object
      properties:
        pricingUpdate:
          type: string
          format: date-time
          readOnly: true
        securityDeposit:
          type: number
          description: Money required as deposit
        cleaningFee:
          type: number
          description: Money required as cleaning fee
        defaultDailyPrice:
          type: number
          description: Money required as default daily price (filled according the
            room)
          readOnly: true
        weekendPrice:
          type: number
          description: Money required on weekends
        guestsIncluded:
          type: integer
          description: Number of guests included or this pricing
          format: int32
        priceExtraPerson:
          type: number
          description: Money required for each extra person (range guestsIncluded
            - $.listing.maxCapacity)
        priceExtraPersonType:
          $ref: "#/components/schemas/PortalCustomItemValueType"
        basePrice:
          type: number
          description: (Money) minimum price (filled according the room)
          readOnly: true
        currency:
          type: string
          description: Currency according to ISO(3) Standard (filled according property)
          readOnly: true
        monthlyDiscount:
          type: integer
          description: "Monthly discount, Discount to apply for the reservation that\
            \ last longer that one month. The value is in %. Deprecated, use standard\
            \ discounts"
          format: int32
          deprecated: true
        weeklyDiscount:
          type: integer
          description: "Weekly discount, Discount to apply to stays longer than 1\
            \ week. The value is in %. Deprecated. Use standard discounts"
          format: int32
        discountNotRefundable:
          type: integer
          description: "Fixed discount to apply in case the guest choose to give up\
            \ on the refundable policy exchanging it with a discount (values in %,\
            \ the value is a reduction, so 100 equals to be free)"
          format: int32
        homeawayPricing:
          type: string
          enum:
          - GUARANTEED
          - QUOTED
        distributionModel:
          uniqueItems: true
          type: array
          description: Whether the property prefers to collect the money or let the
            OTA collect them.
          items:
            type: string
            description: Whether the property prefers to collect the money or let
              the OTA collect them.
            enum:
            - OTA_COLLECTED
            - PROPERTY_COLLECTED
        discounts:
          uniqueItems: true
          type: array
          description: "Currently supported by: [AIRBNB]. These are discounts that\
            \ will be applied without consider the period of the booking (So are fixed).\
            \ They may impact last minute discounts or early bid discounts"
          items:
            $ref: "#/components/schemas/ExternalDiscount"
        pricingModel:
          type: string
          description: "Default type of pricing model for this accommodation (i.e.\
            \ per day / occupancy based, etc..)"
          readOnly: true
          enum:
          - NONE
          - PER_DAY
          - PER_PERSON
          - PER_OCCUPANCY
          - PER_OCCUPANCY_CHILD
        taxes:
          uniqueItems: true
          type: array
          description: Tax model to send to portal
          items:
            $ref: "#/components/schemas/TaxImpl"
        taxCollectionType:
          type: object
          additionalProperties:
            type: string
            description: Define the way the tax can be collected by each portal
            readOnly: true
            enum:
            - INELIGIBLE
            - NO_PORTAL_COLLECTED_TAX
            - OVERRIDE_PORTAL_COLLECTED_TAX
            - STACKED_PORTAL_COLLECTED_TAX
            - UNDEFINED
          description: Define the way the tax can be collected by each portal
          readOnly: true
        acceptToPayTaxes:
          type: boolean
          description: Attestation regarding the user will pay the taxes
          readOnly: true
        acceptFirstReservationDiscount:
          type: boolean
          description: Allow a discounted rate for first reservations
          readOnly: true
    PortalCustomItemValueType:
      type: object
      properties:
        values:
          type: object
          properties:
            empty:
              type: boolean
          additionalProperties:
            type: string
            enum:
            - FIXED
            - PERCENT
          writeOnly: true
        fallback:
          type: string
          writeOnly: true
          enum:
          - FIXED
          - PERCENT
        portalValues:
          type: object
          properties:
            empty:
              type: boolean
          additionalProperties:
            type: string
            enum:
            - FIXED
            - PERCENT
      description: Holidu option to setup the value as fixed or per person
    PortalMapStringValueType:
      type: object
      properties:
        empty:
          type: boolean
      additionalProperties:
        type: string
        enum:
        - FIXED
        - PERCENT
    TaxExemptionImpl:
      type: object
      properties:
        dayFrom:
          type: integer
          format: int32
        dayTo:
          type: integer
          format: int32
        ageFrom:
          type: integer
          format: int32
        ageTo:
          type: integer
          format: int32
        maxCapPersonNight:
          type: number
    TaxImpl:
      type: object
      properties:
        taxType:
          type: string
          enum:
          - HOTEL_TAX
          - LODGING_TAX
          - ROOM_TAX
          - SALES_TAX
          - TOURIST_FEE
          - TOURIST_TAX
          - TRANSIENT_OCCUPANCY_TAX
          - VAT_GST_TAX
        taxableBase:
          type: array
          items:
            type: string
            enum:
            - ROOM_BASE_NET
            - RATE_PLAN_CORRECTION
            - ROOM_TAX
            - EXTRA_NET
            - EXTRA_TAX
            - CLEANING_COST_NET
            - COMMISSION
            - CITY_TAX
        taxAmount:
          type: number
        taxAmountType:
          type: string
          enum:
          - PERCENT_VALUE
          - FLAT_PER_NIGHT
          - FLAT_PER_GUEST_PER_STAY
          - FLAT_PER_GUEST_PER_NIGHT
          - FLAT_PER_STAY
        businessTaxId:
          type: string
        registrationId:
          type: string
        exemptions:
          type: array
          items:
            $ref: "#/components/schemas/TaxExemptionImpl"
        portalName:
          type: string
        readonly:
          type: boolean
        selected:
          type: boolean
      description: Tax model to send to portal
    ExternalRateContent:
      type: object
      properties:
        Name used by the property manager to identity this rate:
          type: string
        relative ids in the external channels:
          $ref: "#/components/schemas/PortalCustomItemString"
        ? last activation status for this portal. May be unavailable, in this case
          key of the map is missing. Key is the name of the portal in Octorate format.
        : type: object
          additionalProperties:
            type: boolean
        (Only Agoda supports it) - Type of threatment of this rate:
          $ref: "#/components/schemas/PortalCustomItemString"
        (Only Agoda supports it) - Type of channel (Where sell this rate):
          type: string
          enum:
          - RETAIL
          - PRIVATE_SALE
          - LOCALS_DOMESTIC_ONLY
          - MOBILE_ONLY
          - OPAQUE_TRAVEL_PRIVATE
          - CHINA_ONLY
          - PACKAGE
          - VIP_AFFILIATION
          - CORPORATE
        '(Only BookingSuite) - Relation between the parent rate (value) ':
          type: integer
          format: int32
        '(Only BookingSuite) - Relation between the parent rate (type) ':
          type: string
          enum:
          - FIXED
          - PERCENT
        (Booking.com) All the appliable rate restrictions:
          type: array
          items:
            $ref: "#/components/schemas/ExternalRateRestriction"
        derived:
          uniqueItems: true
          type: array
          items:
            $ref: "#/components/schemas/ExternalRateDerived"
        javaId:
          type: string
        serializedName:
          type: string
    ExternalRateDerived:
      type: object
      properties:
        occupancy:
          type: integer
          format: int32
        additionalPrice:
          type: number
        percentage:
          type: integer
          format: int32
        javaId:
          type: string
        serializedName:
          type: string
    ExternalRateRestriction:
      type: object
      properties:
        model:
          type: string
          enum:
          - NO_RESTRICTED
          - DATE_RANGE
          - LENGTH_OF_STAY
          - ADVANCE_DAYS
          - ACCESS_CODE
          - MEAL
          - OCCUPANCY
          - SELL_STAY_RANGE
        startDate:
          type: string
          format: date-time
        endDate:
          type: string
          format: date-time
        startSellStayDate:
          type: string
          format: date-time
        minAdvanceDays:
          type: integer
          format: int32
        maxAdvanceDays:
          type: integer
          format: int32
        accessCode:
          type: string
        minStay:
          type: integer
          format: int32
        maxStay:
          type: integer
          format: int32
        minAdvancePeriod:
          type: object
          properties:
            years:
              type: integer
              format: int32
            months:
              type: integer
              format: int32
            days:
              type: integer
              format: int32
            zero:
              type: boolean
            negative:
              type: boolean
            units:
              type: array
              items:
                type: object
                properties:
                  durationEstimated:
                    type: boolean
                  duration:
                    type: object
                    properties:
                      seconds:
                        type: integer
                        format: int64
                      zero:
                        type: boolean
                      nano:
                        type: integer
                        format: int32
                      negative:
                        type: boolean
                      positive:
                        type: boolean
                  timeBased:
                    type: boolean
                  dateBased:
                    type: boolean
            chronology:
              type: object
              properties:
                id:
                  type: string
                calendarType:
                  type: string
                isoBased:
                  type: boolean
        maxAdvancePeriod:
          type: object
          properties:
            years:
              type: integer
              format: int32
            months:
              type: integer
              format: int32
            days:
              type: integer
              format: int32
            zero:
              type: boolean
            negative:
              type: boolean
            units:
              type: array
              items:
                type: object
                properties:
                  durationEstimated:
                    type: boolean
                  duration:
                    type: object
                    properties:
                      seconds:
                        type: integer
                        format: int64
                      zero:
                        type: boolean
                      nano:
                        type: integer
                        format: int32
                      negative:
                        type: boolean
                      positive:
                        type: boolean
                  timeBased:
                    type: boolean
                  dateBased:
                    type: boolean
            chronology:
              type: object
              properties:
                id:
                  type: string
                calendarType:
                  type: string
                isoBased:
                  type: boolean
        rateMealType:
          type: array
          items:
            type: string
            enum:
            - ALL_INCLUSIVE
            - BREAKFAST
            - LUNCH
            - DINNER
            - AMERICAN
            - BED_AND_BREAKFAST
            - BUFFET_BREAKFAST
            - CARRIBBEAN_BREAKFAST
            - CONTINENTAL_BREAKFAST
            - ENGLISH_BREAKFAST
            - EUROPEAN
            - FAMILY_PLAN
            - FULL_BOARD
            - FULL_BREAKFAST
            - HALF_BOARD
            - SELF_CATERING
            - ROOM_ONLY
    ExternalReservationConf:
      required:
      - checkinTimeEnd
      - checkinTimeStart
      - childrenExtraPrice
      type: object
      properties:
        childrenAllowed:
          type: boolean
        childrenQuantity:
          type: integer
          format: int32
        childrenMaxAge:
          type: integer
          format: int32
        childrenExtraPrice:
          type: number
        noChildrenReason:
          type: string
        smokersAllowed:
          type: boolean
          default: false
        petsAllowed:
          type: boolean
          default: false
        eventsAllowed:
          type: boolean
          default: false
        infantsAllowed:
          type: boolean
          default: false
        welcomeMessage:
          type: string
          description: Welcome message for instant bookings
          example: "My dear guest, I looking forward to have you in my home!"
        instantBookingCategory:
          type: string
          description: Special field for Airbnb that describes a requirement in instant
            bookings
          enum:
          - "off"
          - everyone
          - well_reviewed_guests
          - guests_with_verified_identity
          - well_reviewed_guests_with_verified_identity
        noticeHours:
          type: integer
          description: Notice hour for reservations
          format: int32
        mininumAge:
          type: integer
          format: int32
        homeawayBookingPolicy:
          type: string
          enum:
          - QUOTEHOLD
          - INSTANT
        checkinTimeStart:
          type: integer
          format: int32
        checkinTimeEnd:
          type: integer
          format: int32
        checkoutTime:
          type: integer
          format: int32
        bookingPolicy:
          type: string
          description: "External Booking Policy for the listing: Whether reservation\
            \ is immediately confirmed or not"
          enum:
          - NEED_CONFIRMATION
          - INSTANT
    ExternalBedDescriptor:
      type: object
      properties:
        quantity:
          type: integer
          format: int32
        included:
          type: boolean
        bedType:
          type: string
          enum:
          - KING
          - QUEEN
          - DOUBLE
          - SINGLE
          - TWIN
          - SOFA
          - BUNK
          - COUCH
          - AIR_MATTRES
          - FLOOR_MATTRESS
          - TODDLER
          - CRIB
          - WATER
          - HAMMOCK
          - MALE_CAPSULE
          - FEMALE_CAPSULE
        transientExternal:
          type: object
          additionalProperties:
            type: string
        applicableUntilAge:
          type: integer
          format: int32
        extraPrice:
          type: number
    ExternalRoomDescriptor:
      type: object
      properties:
        type:
          type: string
          enum:
          - BEDROOM
          - LIVING_ROOM
          - BATHROOM
          - BACKYARD
          - FRONT_YARD
          - BASEMENT
          - COMMON_SPACE
          - COMMON_SPACES
          - DINING_ROOM
          - ENTRANCE_TO_HOME
          - EXTERIOR
          - FAMILY_ROOM
          - FULL_BATHROOM
          - HALF_BATHROOM
          - HOT_TUB
          - GARAGE
          - GYM
          - KITCHEN
          - KITCHENETTE
          - LAUNDRY_ROOM
          - OFFICE
          - OUTDOOR_COMMON_AREA
          - OUTDOOR_SPACE
          - PATIO
          - POOL
          - RECREATION_AREA
          - STUDY
          - STUDIO
          - OTHER
        privateSpace:
          type: boolean
        halfBathroom:
          type: boolean
        location:
          type: string
          enum:
          - ENSUITE
          - NEXT_DOOR
          - DOWN_THE_HALL
          - OPPOSITE_THE_ROOM
          - IN_THE_HALLWAY
          - OTHER
          - INSIDE_THE_UNIT
        roomNumber:
          type: integer
          format: int32
        subRoomConfigurations:
          type: array
          items:
            $ref: "#/components/schemas/ExternalSubroomConfigurationDescriptor"
        maxGuests:
          type: integer
          format: int32
        bathtubPresent:
          type: boolean
        showerPresent:
          type: boolean
        description:
          type: string
        defaultSubRoomBeds:
          type: array
          items:
            $ref: "#/components/schemas/ExternalBedDescriptor"
        defaultConfiguration:
          $ref: "#/components/schemas/ExternalSubroomConfigurationDescriptor"
    ExternalSubroomConfigurationDescriptor:
      type: object
      properties:
        beds:
          type: array
          items:
            $ref: "#/components/schemas/ExternalBedDescriptor"
        defaultConfiguration:
          type: boolean
    ApiPmsRoom:
      required:
      - name
      - parentId
      type: object
      properties:
        id:
          type: integer
          description: Unique id of this pms room
          format: int64
        parentId:
          type: integer
          description: "Parent Room, this is the typology (i.e. Double room)"
          format: int64
        name:
          type: string
          description: The name of the PMS room
          example: "101, Sea Room"
        clean:
          type: boolean
          description: The status of the cleaning service. Logic here is ternary (null
            means unknown)
          nullable: true
        linesChangeFrequency:
          type: integer
          description: Frequency of change of linens. The value here is in DAYS.
          format: int32
        cleaningFrequency:
          type: integer
          description: Frequency of cleaning of the room. The value here is in DAYS.
          format: int32
        lastCleaningDate:
          type: string
          description: The last time this PMS room was clean
          format: date-time
        cleaningDays:
          type: array
          description: List of days where cleaning is performed
          items:
            type: string
            description: List of days where cleaning is performed
            enum:
            - MONDAY
            - TUESDAY
            - WEDNESDAY
            - THURSDAY
            - FRIDAY
            - SATURDAY
            - SUNDAY
        notes:
          type: string
          description: Notes that the property owner can set
        timeZone:
          type: object
          properties:
            displayName:
              type: string
            id:
              type: string
            dstsavings:
              type: integer
              format: int32
            rawOffset:
              type: integer
              format: int32
          description: Timezone of the room's property
    ApiItemResponse:
      type: object
      properties:
        resource:
          $ref: "#/components/schemas/ApiLink"
        data:
          type: object
    ApiAmenity:
      type: object
      properties:
        internalLabel:
          type: string
          description: Internal label we use for this amenity
        id:
          type: integer
          description: The id of this amenity
          format: int64
        internalName:
          type: string
          description: name of this amenity
        label:
          type: string
          description: Translated value of the label
        values:
          type: object
          additionalProperties:
            type: string
            description: Values used inside the external portals
          description: Values used inside the external portals
        aiEnabled:
          type: boolean
          description: Is this amenity available to the AI Assistant?
        suggested:
          type: boolean
          description: Is this amenity suggested?
        image:
          type: string
          description: The image of this amenity (SVG)
      description: "The amenities to to use for the Booking Engine. For a complete\
        \ list of amenities code, refer to rest/v1/meta/octorateAmenities endpoint"
    ApiListingPlaceDTO:
      type: object
      properties:
        address:
          type: string
        civicNumber:
          type: string
        city:
          type: string
        locality:
          type: string
        districtName:
          type: string
        country:
          type: string
          enum:
          - AF
          - AX
          - AL
          - DZ
          - AS
          - AD
          - AO
          - AI
          - AQ
          - AG
          - AR
          - AM
          - AW
          - AU
          - AT
          - AZ
          - BS
          - BH
          - BD
          - BB
          - BY
          - BE
          - BZ
          - BJ
          - BM
          - BT
          - BO
          - BQ
          - BA
          - BW
          - BV
          - BR
          - IO
          - BN
          - BG
          - BF
          - BI
          - KH
          - CM
          - CA
          - CV
          - KY
          - CF
          - TD
          - CL
          - CN
          - CX
          - CC
          - CO
          - KM
          - CG
          - CD
          - CK
          - CR
          - CI
          - HR
          - CU
          - CW
          - CY
          - CZ
          - DK
          - DJ
          - DM
          - DO
          - EC
          - EG
          - SV
          - GQ
          - ER
          - EE
          - ET
          - FK
          - FO
          - FJ
          - FI
          - FR
          - GF
          - PF
          - TF
          - GA
          - GM
          - GE
          - DE
          - GH
          - GI
          - GR
          - GL
          - GD
          - GP
          - GU
          - GT
          - GG
          - GN
          - GW
          - GY
          - HT
          - HM
          - VA
          - HN
          - HK
          - HU
          - IS
          - IN
          - ID
          - IR
          - IQ
          - IE
          - IM
          - IL
          - IT
          - JM
          - JP
          - JE
          - JO
          - KZ
          - KE
          - KI
          - KP
          - KR
          - KW
          - KG
          - LA
          - LV
          - LB
          - LS
          - LR
          - LY
          - LI
          - LT
          - LU
          - MO
          - MK
          - MG
          - MW
          - MY
          - MV
          - ML
          - MT
          - MH
          - MQ
          - MR
          - MU
          - YT
          - MX
          - FM
          - MD
          - MC
          - MN
          - ME
          - MS
          - MA
          - MZ
          - MM
          - NA
          - NR
          - NP
          - NL
          - NC
          - NZ
          - NI
          - NE
          - NG
          - NU
          - NF
          - MP
          - "NO"
          - OM
          - PK
          - PW
          - PS
          - PA
          - PG
          - PY
          - PE
          - PH
          - PN
          - PL
          - PT
          - PR
          - QA
          - RE
          - RO
          - RU
          - RW
          - BL
          - SH
          - KN
          - LC
          - MF
          - PM
          - VC
          - WS
          - SM
          - ST
          - SA
          - SN
          - RS
          - SC
          - SL
          - SG
          - SX
          - SK
          - SI
          - SB
          - SO
          - ZA
          - GS
          - SS
          - ES
          - LK
          - SD
          - SR
          - SJ
          - SZ
          - SE
          - CH
          - SY
          - TW
          - TJ
          - TZ
          - TH
          - TL
          - TG
          - TK
          - TO
          - TT
          - TN
          - TR
          - TM
          - TC
          - TV
          - UG
          - UA
          - AE
          - GB
          - US
          - UM
          - UY
          - UZ
          - VU
          - VE
          - VN
          - VG
          - VI
          - WF
          - EH
          - YE
          - ZM
          - ZW
          - XJ
        latitude:
          type: number
          format: double
        longitude:
          type: number
          format: double
        zoom:
          type: integer
          format: int32
        phone:
          type: string
        zipCode:
          type: string
        additionalInformation:
          type: string
        countryAlpha2:
          type: string
        phone2:
          type: string
        phonePrefix:
          type: string
        firstLocality:
          type: string
      description: The location of this listing
    ApiRoomAmenityDTO:
      type: object
      properties:
        id:
          type: integer
          description: The id of this room amenity
          format: int64
          readOnly: true
        roomId:
          type: integer
          description: The id of the room
          format: int64
        amenityId:
          type: integer
          description: The id of the amenity
          format: int64
        details:
          type: string
          description: Details of this room amenity
        title:
          type: string
          description: Title
      readOnly: true
    ApiRoomDTO:
      required:
      - accommodationId
      - adults
      - bookingEngine
      - breakfastIncluded
      - calendar
      - closeNextDays
      - manualReservations
      - notRefundable
      - openNextDays
      - rmsDerived
      - statistic
      - tripeThePrice
      - website
      type: object
      properties:
        name:
          type: string
          description: name of this room
          example: Double room
        id:
          type: integer
          description: The id of this product
          format: int64
          readOnly: true
        headline:
          type: object
          additionalProperties:
            type: string
            description: "Selling name (presented to booking engine customers), of\
              \ the main tipology or the derived rate"
            example: "{\"EN\":\"Double Room\"}"
          description: "Selling name (presented to booking engine customers), of the\
            \ main tipology or the derived rate"
          example:
            EN: Double Room
        basicName:
          type: object
          properties:
            emptyValues:
              type: boolean
            empty:
              type: boolean
          additionalProperties:
            type: string
            description: Typology Name - this will be kept by default for each potential
              derived rate
            example: "{\"EN\":\"These are the LanguageMap value in English!\"}"
            default: "{\"EN\":\"These are the access rule in English!\"}"
          description: Typology Name - this will be kept by default for each potential
            derived rate
          example:
            EN: These are the LanguageMap value in English!
          default:
            EN: These are the access rule in English!
        rateName:
          type: object
          additionalProperties:
            type: string
            description: Room/Apartment Name - Acts as rate name if you have entered
              an headline. This is useful only if you do not have specified the rate
              plans
            example: Not Refundable
            deprecated: true
          description: Room/Apartment Name - Acts as rate name if you have entered
            an headline. This is useful only if you do not have specified the rate
            plans
          example: Not Refundable
          deprecated: true
        sellingName:
          type: object
          additionalProperties:
            type: string
            description: Room/Apartment Name - Acts as rate name if you have entered
              an headline. This is useful only if you do not have specified the rate
              plans
            example: Double Room - Not Refundable
            deprecated: true
          description: Room/Apartment Name - Acts as rate name if you have entered
            an headline. This is useful only if you do not have specified the rate
            plans
          example: Double Room - Not Refundable
          deprecated: true
        labels:
          type: object
          properties:
            emptyValues:
              type: boolean
            empty:
              type: boolean
          additionalProperties:
            type: string
            description: "label that is used inside our booking engine to describe\
              \ the unit of measure. For instance to say '1 Room', '1 Castle', '1\
              \ Apartment', '1 Cavaran', etc...."
            example: "{\"EN\":\"These are the LanguageMap value in English!\"}"
            default: "{\"EN\":\"These are the access rule in English!\"}"
          description: "label that is used inside our booking engine to describe the\
            \ unit of measure. For instance to say '1 Room', '1 Castle', '1 Apartment',\
            \ '1 Cavaran', etc...."
          example:
            EN: These are the LanguageMap value in English!
          default:
            EN: These are the access rule in English!
        infants:
          type: integer
          description: Number of maximum infants
          format: int32
        dormitory:
          type: boolean
          description: "(*Required only in main tipology) If true, this value means\
            \ that this room/listing has to be considered as a dormitory room"
        notRefundable:
          type: boolean
          description: True if this room is not refundable. Currently is going to
            be replaced by the rate plans for newer accounts
          deprecated: true
        breakfastIncluded:
          type: boolean
          description: True if breakfast is included. Currently is going to be replaced
            by the rate plans for newer accounts
          deprecated: true
        statistic:
          type: boolean
          description: "If true this product should be considered in statistics (occupancy,etc..)"
        calendar:
          type: boolean
          description: If true this product should be visibile in our calendar
        website:
          type: boolean
          description: If true this product should be visibile in the generated website
            for the property
        bookingEngine:
          type: boolean
          description: If true this product should be visibile in the generated booking
            engine (engine for reservations) for the property
        manualReservations:
          type: boolean
          description: If true this product should be visibile in the manual reservations
            when the property search for rooms
        quantity:
          minimum: 1
          type: integer
          description: How many rooms are sellable? Keep care! This value might impact
            availability
          format: int32
          default: 1
        bathroomQuantity:
          type: integer
          description: "Number of available bathroom, the number of the bathrooms\
            \ will be automatically calculated in the SubRooms"
          format: int32
          deprecated: true
        bedroomQuantity:
          type: integer
          description: "Number of available bedroom, the number of the bedrooms will\
            \ be automatically calculated in the SubRooms"
          format: int32
          deprecated: true
        bedQuantity:
          type: integer
          description: "Number of available BEDS, the number of the beds will be automatically\
            \ calculated in the SubRooms"
          format: int32
          deprecated: true
        squareMetersSize:
          minimum: 10.0
          type: integer
          description: Square meters of this room
          format: int32
          example: 23
        legalIdIssuer:
          type: string
          description: 'The issuer of the legal id (@see legal id) '
          example: "State of New York, tourism office"
        legalId:
          type: string
          description: Legal id if needed for this room/listing. It could be the region/country/other
            institution license
          example: MC123FG1
        minimumSellingPrice:
          minimum: 10.0
          type: number
          description: Minimum selling price if price is missing
          example: 100.23
        derivedRule:
          $ref: "#/components/schemas/DerivedRule"
        location:
          $ref: "#/components/schemas/ApiListingPlaceDTO"
        description:
          type: object
          additionalProperties:
            type: string
            description: Description to show to customers inside our Booking Engine
            example: "{\"EN\":\"Double Room is a nice room, book it now!\"}"
          description: Description to show to customers inside our Booking Engine
          example:
            EN: "Double Room is a nice room, book it now!"
        wifi:
          type: object
          additionalProperties:
            type: string
            description: Wifi suggestion for the property
          description: Wifi suggestion for the property
        nearInfo:
          type: object
          additionalProperties:
            type: string
            description: Near to information
          description: Near to information
        guestInfo:
          type: object
          additionalProperties:
            type: string
            description: General information for guests for this room
          description: General information for guests for this room
        invoiceInfo:
          type: object
          additionalProperties:
            type: string
            description: Invoice information to add to any invoice that use this rrom
          description: Invoice information to add to any invoice that use this rrom
        tripeThePrice:
          type: boolean
          description: |-
            By activating this option, the system will triple the room price as soon as it appears without any availability on the Octorate calendar.
            The option is to avoid overbooking on portals where there is an allotment on the room in question.
          default: false
        closeNextDays:
          type: integer
          description: "This option, as well as the CutOff days, aims to avoid last\
            \ minute reservations: every day, at midnight, the system will put the\
            \ rate in Stop Sale for a number of days corresponding to the value entered!"
          format: int32
          default: 0
        openNextDays:
          type: integer
          description: "This option, will remove the Stop Sell, for a date after X+1\
            \ every day! Zero for turn off"
          format: int32
          default: 0
        adults:
          type: integer
          description: Adults quantity
          format: int32
        guestsDormitory:
          type: integer
          description: Guests number in dormitory mode
          format: int32
        children:
          type: integer
          description: Children quantity
          format: int32
        policeCode:
          type: integer
          description: Police Room / Apartment code
          format: int64
        ratePlans:
          type: array
          description: "List of rateplans accepted by the Room. Used mainly in Booking\
            \ Engine only. For specific functionality of this field, try on the frontend\
            \ using also the booking engine. For Channel connectivity, you can ignore"
          items:
            $ref: "#/components/schemas/ApiRateDTO"
        amenities:
          type: array
          description: "The amenities to to use for the Booking Engine. For a complete\
            \ list of amenities code, refer to rest/v1/meta/octorateAmenities endpoint"
          items:
            $ref: "#/components/schemas/ApiAmenity"
        icalUrls:
          type: array
          description: "With the iCal connection, Octorate is enabled to check the\
            \ ics data in order to create correspondence: dates will be synchronized,\
            \ so that all the dates mistakenly open will then be closed. Reservations\
            \ and availabilities will then be synced. "
          items:
            type: string
            description: "With the iCal connection, Octorate is enabled to check the\
              \ ics data in order to create correspondence: dates will be synchronized,\
              \ so that all the dates mistakenly open will then be closed. Reservations\
              \ and availabilities will then be synced. "
        cancellationPolicyId:
          type: integer
          description: "Link a cancellation policy. It can be used only with the old\
            \ system where as we do not support rate plans. In case of rateplans,\
            \ directly link the rate plan with the cancel policy"
          format: int64
          example: 32
        paymentPolicyId:
          type: integer
          description: "Link a payment policy. It can be used only with the old system\
            \ where as we do not support rate plans. In case of rateplans, directly\
            \ link the rate plan with the paymeny policy"
          format: int64
          example: 12
        notificationEmail:
          type: string
          description: Email where octorate shall send notifications about this room
        tripleThePrice:
          type: boolean
          description: "By activating this option, Octorate will triplicate the room\
            \ price as soon as there will be 0 availability on the calendar. \nThis\
            \ feature is very useful to avoid overbooking if you manage OTAs that\
            \ need allotment. Warning: if you get a cancellation, regular price needs\
            \ to be set manually."
        roomCategory:
          type: string
          description: The room categorization
          example: KING
          enum:
          - STANDARD
          - SINGLE
          - QUEEN
          - KING
          - TWIN
          - HOLLYWOOD_TWIN
          - DOUBLE_DOUBLE
          - STUDIO
          - DELUXE
          - JOINT
          - CONNECTING
          - SUITE
          - APARTMENT
          - ACCESIBLE
          - CABANA
          - VILLA
          - PENTHOUSE
        rmsDerived:
          type: boolean
          description: Indicate if this room is rms derived
        accommodationId:
          type: string
          description: id of the accommodation of this room
          example: "999999"
        hideRooms:
          type: array
          description: Rooms hidden by this room
          example:
          - 12345
          - 67889
          items:
            type: integer
            description: Rooms hidden by this room
            format: int64
        getiCalRandomName:
          type: string
          description: The iCal random name
        revenueActive:
          type: boolean
          description: TRUE if automatic price increase is enabled
        revenueMinPrice:
          type: integer
          description: The minimum price if automatic price increase is enabled
          format: int32
        revenueMaxPrice:
          type: integer
          description: The maximum price if automatic price increase is enabled
          format: int32
        revenueMaxIncrementPercent:
          type: boolean
          description: TRUE if automatic price increase is by percentage
        revenueMaxIncrement:
          type: integer
          description: The increment step if automatic price increase is enabled
          format: int32
        preferredCheckinClerk:
          type: integer
          description: The preferred checkin clerk
          format: int64
          example: 123
        preferredCheckoutClerk:
          type: integer
          description: The preferred checkout clerk
          format: int64
          example: 456
        preferredHousekeeperClerk:
          type: integer
          description: The preferred housekeeper clerk
          format: int64
          example: 789
        roomMaintenances:
          type: array
          description: The room maintenances of this room
          items:
            $ref: "#/components/schemas/ApiRoomMaintenanceDTO"
        subRooms:
          type: array
          description: The list of the subrooms of this room
          items:
            $ref: "#/components/schemas/ApiSubRoom"
        showSubroomDetail:
          type: boolean
          description: True to show the list of the subrooms in the BE
        nrua:
          type: string
          description: "NRUA (Número de Registro Único de Arrendamientos), it is a\
            \ mandatory national identification code for short-term rentals in Spain\
            \ (holiday homes/tourist accommodations/seasonal rentals)."
        roomAmenities:
          type: array
          items:
            $ref: "#/components/schemas/ApiRoomAmenityDTO"
        activitiesInfo:
          type: object
          additionalProperties:
            type: string
        headlineLangMap:
          type: object
          properties:
            emptyValues:
              type: boolean
            empty:
              type: boolean
          additionalProperties:
            type: string
            example: "{\"EN\":\"These are the LanguageMap value in English!\"}"
            default: "{\"EN\":\"These are the access rule in English!\"}"
          writeOnly: true
          example:
            EN: These are the LanguageMap value in English!
          default:
            EN: These are the access rule in English!
        descriptionLangMap:
          type: object
          properties:
            emptyValues:
              type: boolean
            empty:
              type: boolean
          additionalProperties:
            type: string
            example: "{\"EN\":\"These are the LanguageMap value in English!\"}"
            default: "{\"EN\":\"These are the access rule in English!\"}"
          writeOnly: true
          example:
            EN: These are the LanguageMap value in English!
          default:
            EN: These are the access rule in English!
        checkinInfo:
          type: object
          additionalProperties:
            type: string
    ApiRoomMaintenanceDTO:
      type: object
      properties:
        id:
          type: integer
          description: Unique identifier of this Room Maintenance
          format: int64
        roomId:
          type: integer
          description: The identifier of the room for the maintenance
          format: int64
        createTime:
          type: string
          description: The creation date of this rule
          format: date-time
        title:
          type: string
          description: The title of this Room Maintenance
        description:
          type: string
          description: The description of this Room Maintenance
        startDate:
          type: string
          description: The start date of this Room Maintenance
          format: date-time
        frequency:
          type: string
          description: "The frequency of this Room Maintenance (NONE, MONTHLY, YEARLY)"
          enum:
          - NONE
          - DAILY
          - WEEKLY
          - WEEKLY_ON
          - MONTHLY
          - QUARTELY
          - YEARLY
          - EVERY_N_DAYS
          - SAME_DAYWEEK_OF_MONTH
          - LAST_WEEKDAY_OF_MONTH
          - EASTER
        user:
          type: integer
          description: The user who complete this Room Maintenance
          format: int64
        completedDate:
          type: string
          description: The completed date of this Room Maintenance
          format: date-time
        attachment:
          $ref: "#/components/schemas/AttachmentDTO"
        sendDate:
          type: string
          description: The send date of this Room Maintenance
          format: date-time
      description: The room maintenances of this room
    ApiSubRoom:
      type: object
      properties:
        roomId:
          type: integer
          format: int64
        subRoomConfigurations:
          type: array
          items:
            $ref: "#/components/schemas/ApiSubRoomConfiguration"
        maxGuests:
          type: integer
          format: int32
        subRoomBathroom:
          $ref: "#/components/schemas/ApiSubRoomBathroom"
        roomNumber:
          type: integer
          format: int32
        subRoomBeds:
          type: array
          items:
            $ref: "#/components/schemas/ApiSubRoomBed"
        privateSpace:
          type: boolean
        id:
          type: integer
          format: int64
        type:
          type: string
          enum:
          - BEDROOM
          - LIVING_ROOM
          - BATHROOM
          - BACKYARD
          - FRONT_YARD
          - BASEMENT
          - COMMON_SPACE
          - COMMON_SPACES
          - DINING_ROOM
          - ENTRANCE_TO_HOME
          - EXTERIOR
          - FAMILY_ROOM
          - FULL_BATHROOM
          - HALF_BATHROOM
          - HOT_TUB
          - GARAGE
          - GYM
          - KITCHEN
          - KITCHENETTE
          - LAUNDRY_ROOM
          - OFFICE
          - OUTDOOR_COMMON_AREA
          - OUTDOOR_SPACE
          - PATIO
          - POOL
          - RECREATION_AREA
          - STUDY
          - STUDIO
          - OTHER
      description: The list of the subrooms of this room
    ApiSubRoomBathroom:
      type: object
      properties:
        halfBathroom:
          type: boolean
        privateSpace:
          type: boolean
        bathtubPresent:
          type: boolean
        showerPresent:
          type: boolean
        subRoomId:
          type: integer
          format: int64
        location:
          type: string
          enum:
          - ENSUITE
          - NEXT_DOOR
          - DOWN_THE_HALL
          - OPPOSITE_THE_ROOM
          - IN_THE_HALLWAY
          - OTHER
          - INSIDE_THE_UNIT
        id:
          type: integer
          format: int64
        type:
          type: string
          enum:
          - BEDROOM
          - LIVING_ROOM
          - BATHROOM
          - BACKYARD
          - FRONT_YARD
          - BASEMENT
          - COMMON_SPACE
          - COMMON_SPACES
          - DINING_ROOM
          - ENTRANCE_TO_HOME
          - EXTERIOR
          - FAMILY_ROOM
          - FULL_BATHROOM
          - HALF_BATHROOM
          - HOT_TUB
          - GARAGE
          - GYM
          - KITCHEN
          - KITCHENETTE
          - LAUNDRY_ROOM
          - OFFICE
          - OUTDOOR_COMMON_AREA
          - OUTDOOR_SPACE
          - PATIO
          - POOL
          - RECREATION_AREA
          - STUDY
          - STUDIO
          - OTHER
    ApiSubRoomBed:
      type: object
      properties:
        quantity:
          type: integer
          format: int64
        bedType:
          type: string
          enum:
          - KING
          - QUEEN
          - DOUBLE
          - SINGLE
          - TWIN
          - SOFA
          - BUNK
          - COUCH
          - AIR_MATTRES
          - FLOOR_MATTRESS
          - TODDLER
          - CRIB
          - WATER
          - HAMMOCK
          - MALE_CAPSULE
          - FEMALE_CAPSULE
        id:
          type: integer
          format: int64
        parentId:
          type: integer
          format: int64
    ApiSubRoomConfiguration:
      type: object
      properties:
        subRoomBeds:
          type: array
          items:
            $ref: "#/components/schemas/ApiSubRoomBed"
        subRoomId:
          type: integer
          format: int64
        defaultConfiguration:
          type: boolean
        id:
          type: integer
          format: int64
    AttachmentDTO:
      required:
      - id
      - name
      - type
      type: object
      properties:
        id:
          type: integer
          description: Reference inside our system
          format: int64
          example: 17
        name:
          type: string
          description: The name of this attachment
          example: image.jpg
        type:
          type: string
          description: The type of this attachment
          example: JPEG
          enum:
          - JPEG
          - PNG
          - OCTET_STREAM
        url:
          type: string
          description: The url of this attachment
          example: http://mysite.com/image.jpg
        previewUrl:
          type: string
          description: The preview of this item
          example: http://mysite.com/thumb/image.jpg
        content:
          type: string
          description: The base64 string of this attachment content. Used only for
            the upload
        sortOrder:
          type: integer
          description: Sorting of this photo
          format: int32
          readOnly: true
          example: 12
        repository:
          type: string
          description: Repository Type
          example: ROOM
          enum:
          - ROOM
          - PROPERTY
          - CHAT
        error:
          type: string
          description: "Error of this photo, in case the system was not able to upload\
            \ it"
          readOnly: true
          example: "12"
      description: Attachment DTO
    DerivedRule:
      type: object
      properties:
        parent:
          type: integer
          description: The parent product/room id
          format: int64
        availability:
          type: boolean
          description: Link availability
        stay:
          type: boolean
        restrictions:
          type: boolean
        stopSell:
          type: boolean
          description: Link stopsells
        price:
          type: string
          description: "Way to apply the price. Could be CALENDAR (Exact), INCREMENT(relative)\
            \ or PERCENT (% ratio up / down) "
          enum:
          - CALENDAR
          - INCREMENT
          - PERCENT
        priceValue:
          type: number
        priceRound:
          type: boolean
          description: "if true, round the price"
        accommodationId:
          type: string
        referenceType:
          type: string
          enum:
          - GENERIC
          - RESERVATION
          - PORTALCONNECTION
          - INVOICE
          - PAYMENT
          - ACCOMMODATION
          - VERSION
          - INVOICE_ITEM
          - PAYOFF
          - ROOM
          - ROOMPORTAL
          - CONTENT_PROCESS
          - PAY_STEP
          - ANNUAL_REPORT
          - PERSON
          - USER
        id:
          type: integer
          format: int64
        reservationId:
          type: integer
          format: int64
        invoiceId:
          type: integer
          format: int64
        roomLog:
          type: integer
          format: int64
      description: The derived rule
    ApiAccommodationResponse:
      type: object
      properties:
        status:
          type: string
        codice:
          type: array
          readOnly: true
          deprecated: true
          items:
            type: string
            readOnly: true
            deprecated: true
        refresh_token:
          type: string
        refresh_properties:
          type: array
          items:
            type: string
        identity:
          $ref: "#/components/schemas/OAuthIdentity"
        ids:
          type: string
      readOnly: true
    OAuthIdentity:
      type: object
      properties:
        id:
          type: integer
          format: int64
        apiId:
          type: integer
          format: int64
        refreshToken:
          type: string
        accessToken:
          type: string
        expireTime:
          type: string
          format: date-time
        resources:
          uniqueItems: true
          type: array
          items:
            $ref: "#/components/schemas/OAuthResource"
        userId:
          type: integer
          format: int64
        createTime:
          type: string
          format: date-time
        allowedAddress:
          type: string
        guestId:
          type: integer
          format: int64
    OAuthResource:
      type: object
      properties:
        id:
          type: integer
          format: int64
        codice:
          type: string
        identityId:
          type: integer
          format: int64
          writeOnly: true
        createTime:
          type: string
          format: date-time
        apiPermissionLevel:
          type: array
          items:
            type: string
            enum:
            - RESERVATION_READ
            - RESERVATION_WRITE
            - RESERVATION_SENTITIVE_READ
            - RESERVATION_SENTITIVE_WRITE
            - ACCOMMODATION_READ
            - ACCOMMODATION_WRITE
            - CONTENT_READ
            - CONTENT_WRITE
            - CALENDAR_READ
            - CALENDAR_WRITE
            - PORTAL_READ
            - PORTAL_WRITE
            - PRODUCT_READ
            - PRODUCT_WRITE
            - WEBHOOK_WRITE
            - CONNECTION_READ
            - CONNECTION_WRITE
            - CREDIT_CARD_READ
            - CREDIT_CARD_WRITE
    ApiReservationGuestDTOV2:
      required:
      - address
      - birthCountry
      - checkin
      - checkout
      - citizenship
      - documentCode
      - documentIssueDate
      - documentSupportNumber
      - email
      - familyName
      - givenName
      - residenceCountry
      - sex
      - type
      type: object
      properties:
        id:
          type: integer
          description: Readonly guest id. This id is given only if a 'police record
            guest' is saved
          format: int64
          example: 123123
        type:
          type: string
          description: Describes if this guest is who has been registered when booking
            process has done or it's a registered guest. As new police guests you
            can register only 'GUEST'
          example: BOOKER
          enum:
          - BOOKER
          - GUEST
        accommodatedType:
          type: string
          description: What is the relationship between the guests of the reservation?
          example: MAIN
          enum:
          - SINGLE_GUEST
          - HEAD_OF_FAMILY
          - HEAD_OF_GROUP
          - RELATIVE
          - MEMBER_GROUP
          default: "The first one will be automatically set as head of family, the\
            \ others as relatives if null"
        source:
          type: string
          description: "The source of this record, Readable only, api records will\
            \ be inserted as \" API \""
          readOnly: true
          example: API
          enum:
          - OTHER
          - USER
          - PORTAL
          - WEBCHECKIN
          - APP
          - API
          - SYSTEM
        givenName:
          type: string
          description: Name of the guest
          example: Mario
        familyName:
          type: string
          description: Last name of the guest
          example: Rossi
        customerName:
          type: string
          description: Customer name. This field should not contain guest name but
            other info like company or agency name
        checkin:
          type: string
          description: Date of the checkin of this guest in format yyyy-MM-dd
          example: 2019-12-17
        checkout:
          type: string
          description: Date of the checkout of this guest in format yyyy-MM-dd
          example: 2019-12-17
        birthDate:
          type: string
          description: Birth date of the guest. Can range to TODAY minus 110 years
            to TODAY
          format: date
          example: 1992-10-22
        birthCountry:
          type: string
          description: Birth country in ISO2 CODE.
          example: IT
          enum:
          - AF
          - AX
          - AL
          - DZ
          - AS
          - AD
          - AO
          - AI
          - AQ
          - AG
          - AR
          - AM
          - AW
          - AU
          - AT
          - AZ
          - BS
          - BH
          - BD
          - BB
          - BY
          - BE
          - BZ
          - BJ
          - BM
          - BT
          - BO
          - BQ
          - BA
          - BW
          - BV
          - BR
          - IO
          - BN
          - BG
          - BF
          - BI
          - KH
          - CM
          - CA
          - CV
          - KY
          - CF
          - TD
          - CL
          - CN
          - CX
          - CC
          - CO
          - KM
          - CG
          - CD
          - CK
          - CR
          - CI
          - HR
          - CU
          - CW
          - CY
          - CZ
          - DK
          - DJ
          - DM
          - DO
          - EC
          - EG
          - SV
          - GQ
          - ER
          - EE
          - ET
          - FK
          - FO
          - FJ
          - FI
          - FR
          - GF
          - PF
          - TF
          - GA
          - GM
          - GE
          - DE
          - GH
          - GI
          - GR
          - GL
          - GD
          - GP
          - GU
          - GT
          - GG
          - GN
          - GW
          - GY
          - HT
          - HM
          - VA
          - HN
          - HK
          - HU
          - IS
          - IN
          - ID
          - IR
          - IQ
          - IE
          - IM
          - IL
          - IT
          - JM
          - JP
          - JE
          - JO
          - KZ
          - KE
          - KI
          - KP
          - KR
          - KW
          - KG
          - LA
          - LV
          - LB
          - LS
          - LR
          - LY
          - LI
          - LT
          - LU
          - MO
          - MK
          - MG
          - MW
          - MY
          - MV
          - ML
          - MT
          - MH
          - MQ
          - MR
          - MU
          - YT
          - MX
          - FM
          - MD
          - MC
          - MN
          - ME
          - MS
          - MA
          - MZ
          - MM
          - NA
          - NR
          - NP
          - NL
          - NC
          - NZ
          - NI
          - NE
          - NG
          - NU
          - NF
          - MP
          - "NO"
          - OM
          - PK
          - PW
          - PS
          - PA
          - PG
          - PY
          - PE
          - PH
          - PN
          - PL
          - PT
          - PR
          - QA
          - RE
          - RO
          - RU
          - RW
          - BL
          - SH
          - KN
          - LC
          - MF
          - PM
          - VC
          - WS
          - SM
          - ST
          - SA
          - SN
          - RS
          - SC
          - SL
          - SG
          - SX
          - SK
          - SI
          - SB
          - SO
          - ZA
          - GS
          - SS
          - ES
          - LK
          - SD
          - SR
          - SJ
          - SZ
          - SE
          - CH
          - SY
          - TW
          - TJ
          - TZ
          - TH
          - TL
          - TG
          - TK
          - TO
          - TT
          - TN
          - TR
          - TM
          - TC
          - TV
          - UG
          - UA
          - AE
          - GB
          - US
          - UM
          - UY
          - UZ
          - VU
          - VE
          - VN
          - VG
          - VI
          - WF
          - EH
          - YE
          - ZM
          - ZW
          - XJ
        zipCode:
          type: string
          example: "00022"
        language:
          type: string
          description: The language in the ISO2 CODE. Check SCHEMA for the values
            available
          example: IT
          externalDocs:
            url: https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes
          enum:
          - IT
          - EN
          - FR
          - ES
          - DE
          - RU
          - PT
          - NL
          - JA
          - EL
          - TR
          - ZH
          - CA
          - RO
        residenceCountry:
          type: string
          description: The place where the guest has now the residence in ISO2 CODE.
          example: IT
          enum:
          - AF
          - AX
          - AL
          - DZ
          - AS
          - AD
          - AO
          - AI
          - AQ
          - AG
          - AR
          - AM
          - AW
          - AU
          - AT
          - AZ
          - BS
          - BH
          - BD
          - BB
          - BY
          - BE
          - BZ
          - BJ
          - BM
          - BT
          - BO
          - BQ
          - BA
          - BW
          - BV
          - BR
          - IO
          - BN
          - BG
          - BF
          - BI
          - KH
          - CM
          - CA
          - CV
          - KY
          - CF
          - TD
          - CL
          - CN
          - CX
          - CC
          - CO
          - KM
          - CG
          - CD
          - CK
          - CR
          - CI
          - HR
          - CU
          - CW
          - CY
          - CZ
          - DK
          - DJ
          - DM
          - DO
          - EC
          - EG
          - SV
          - GQ
          - ER
          - EE
          - ET
          - FK
          - FO
          - FJ
          - FI
          - FR
          - GF
          - PF
          - TF
          - GA
          - GM
          - GE
          - DE
          - GH
          - GI
          - GR
          - GL
          - GD
          - GP
          - GU
          - GT
          - GG
          - GN
          - GW
          - GY
          - HT
          - HM
          - VA
          - HN
          - HK
          - HU
          - IS
          - IN
          - ID
          - IR
          - IQ
          - IE
          - IM
          - IL
          - IT
          - JM
          - JP
          - JE
          - JO
          - KZ
          - KE
          - KI
          - KP
          - KR
          - KW
          - KG
          - LA
          - LV
          - LB
          - LS
          - LR
          - LY
          - LI
          - LT
          - LU
          - MO
          - MK
          - MG
          - MW
          - MY
          - MV
          - ML
          - MT
          - MH
          - MQ
          - MR
          - MU
          - YT
          - MX
          - FM
          - MD
          - MC
          - MN
          - ME
          - MS
          - MA
          - MZ
          - MM
          - NA
          - NR
          - NP
          - NL
          - NC
          - NZ
          - NI
          - NE
          - NG
          - NU
          - NF
          - MP
          - "NO"
          - OM
          - PK
          - PW
          - PS
          - PA
          - PG
          - PY
          - PE
          - PH
          - PN
          - PL
          - PT
          - PR
          - QA
          - RE
          - RO
          - RU
          - RW
          - BL
          - SH
          - KN
          - LC
          - MF
          - PM
          - VC
          - WS
          - SM
          - ST
          - SA
          - SN
          - RS
          - SC
          - SL
          - SG
          - SX
          - SK
          - SI
          - SB
          - SO
          - ZA
          - GS
          - SS
          - ES
          - LK
          - SD
          - SR
          - SJ
          - SZ
          - SE
          - CH
          - SY
          - TW
          - TJ
          - TZ
          - TH
          - TL
          - TG
          - TK
          - TO
          - TT
          - TN
          - TR
          - TM
          - TC
          - TV
          - UG
          - UA
          - AE
          - GB
          - US
          - UM
          - UY
          - UZ
          - VU
          - VE
          - VN
          - VG
          - VI
          - WF
          - EH
          - YE
          - ZM
          - ZW
          - XJ
        email:
          type: string
          description: Email of the customer is validated against classic email regex
          example: myname@mycompany.com
        phone:
          type: string
          description: Main phone number including prefix
          example: "+39332554555"
        documentCode:
          type: string
          description: The document code
          example: AS3332DC
        sex:
          type: string
          example: MALE
          enum:
          - MALE
          - FEMALE
        citizenship:
          type: string
          description: The citizenship of the guest in ISO2 CODE.
          example: IT
          enum:
          - AF
          - AX
          - AL
          - DZ
          - AS
          - AD
          - AO
          - AI
          - AQ
          - AG
          - AR
          - AM
          - AW
          - AU
          - AT
          - AZ
          - BS
          - BH
          - BD
          - BB
          - BY
          - BE
          - BZ
          - BJ
          - BM
          - BT
          - BO
          - BQ
          - BA
          - BW
          - BV
          - BR
          - IO
          - BN
          - BG
          - BF
          - BI
          - KH
          - CM
          - CA
          - CV
          - KY
          - CF
          - TD
          - CL
          - CN
          - CX
          - CC
          - CO
          - KM
          - CG
          - CD
          - CK
          - CR
          - CI
          - HR
          - CU
          - CW
          - CY
          - CZ
          - DK
          - DJ
          - DM
          - DO
          - EC
          - EG
          - SV
          - GQ
          - ER
          - EE
          - ET
          - FK
          - FO
          - FJ
          - FI
          - FR
          - GF
          - PF
          - TF
          - GA
          - GM
          - GE
          - DE
          - GH
          - GI
          - GR
          - GL
          - GD
          - GP
          - GU
          - GT
          - GG
          - GN
          - GW
          - GY
          - HT
          - HM
          - VA
          - HN
          - HK
          - HU
          - IS
          - IN
          - ID
          - IR
          - IQ
          - IE
          - IM
          - IL
          - IT
          - JM
          - JP
          - JE
          - JO
          - KZ
          - KE
          - KI
          - KP
          - KR
          - KW
          - KG
          - LA
          - LV
          - LB
          - LS
          - LR
          - LY
          - LI
          - LT
          - LU
          - MO
          - MK
          - MG
          - MW
          - MY
          - MV
          - ML
          - MT
          - MH
          - MQ
          - MR
          - MU
          - YT
          - MX
          - FM
          - MD
          - MC
          - MN
          - ME
          - MS
          - MA
          - MZ
          - MM
          - NA
          - NR
          - NP
          - NL
          - NC
          - NZ
          - NI
          - NE
          - NG
          - NU
          - NF
          - MP
          - "NO"
          - OM
          - PK
          - PW
          - PS
          - PA
          - PG
          - PY
          - PE
          - PH
          - PN
          - PL
          - PT
          - PR
          - QA
          - RE
          - RO
          - RU
          - RW
          - BL
          - SH
          - KN
          - LC
          - MF
          - PM
          - VC
          - WS
          - SM
          - ST
          - SA
          - SN
          - RS
          - SC
          - SL
          - SG
          - SX
          - SK
          - SI
          - SB
          - SO
          - ZA
          - GS
          - SS
          - ES
          - LK
          - SD
          - SR
          - SJ
          - SZ
          - SE
          - CH
          - SY
          - TW
          - TJ
          - TZ
          - TH
          - TL
          - TG
          - TK
          - TO
          - TT
          - TN
          - TR
          - TM
          - TC
          - TV
          - UG
          - UA
          - AE
          - GB
          - US
          - UM
          - UY
          - UZ
          - VU
          - VE
          - VN
          - VG
          - VI
          - WF
          - EH
          - YE
          - ZM
          - ZW
          - XJ
        documentExpire:
          type: string
          description: The expiration of the document
          format: date-time
        addressLine1:
          type: string
          example: 98-120 Brooklyn Ave
        addressLine2:
          type: string
          example: 2nd line of address
        city:
          type: string
          description: "The city in the customer locale. If we have not yet registered\
            \ the value for the country, we might accept any value"
          example: Roma
        address:
          type: string
          example: "15th Street, Manhattan, New York"
        documentIssueDate:
          type: string
          description: Document issue date
          format: date
          example: 2020-10-01
        documentIssuePlace:
          type: string
          description: "In country locale, the city where this document has been issued"
          example: Roma
        policeSentTime:
          type: string
          description: When was sent to the country police
          format: date-time
        policeSentStatus:
          type: boolean
          description: Was this record sent and what was the status?
        invoiceAgency:
          type: boolean
          description: Should we invoice to this agency?
        excludeCityTax:
          type: boolean
          description: Should exclude city tax when invoicing? It means that city
            tax is already paid from the channel
        excludeCityTaxAgency:
          type: boolean
          description: Should exclude city tax when invoicing to this agency?
        travelWay:
          type: string
          example: CAR
          enum:
          - NA
          - CAR
          - PLANE
          - PLANEBUS
          - PLANECAR
          - PLANETRAIN
          - TRAIN
          - BUS
          - CARAVAN
          - SHIP
          - MOTO
          - BICYCLE
          - WALK
          - OTHER
        plateNumber:
          type: string
          example: AB123CD
        tourismType:
          type: string
          example: BEACH_RESORT
          enum:
          - NOT_SPECIFIED
          - EDUCATIONAL
          - BEACH_RESORT
          - CONFERENCE
          - EXHIBITION
          - SPORTIVE
          - SCHOLAR
          - RELIGIOUS
          - SOCIAL
          - AMUSEMENT_PARK
          - THERMAL
          - FOODWINE
          - CYCLETURISM
          - EXCURSION_HIKING
          - OTHER
          - ART
          - PROFESSIONAL
          - HOLIDAY
          - FRIENDS
          - HEALTH
          - SHOPPING
          - TRANSIT
        degree:
          type: string
          example: UNIVERSITY_DEGREE
          enum:
          - NOT_SPECIFIED
          - PRIMARY_DIPLOMA
          - HIGH_DIPLOMA
          - UNIVERSITY_DEGREE
          - OTHER
          - MIDDLE_DIPLOMA
        travelRefer:
          type: string
          example: DIRECT_WEB
          enum:
          - NOT_SPECIFIED
          - DIRECT
          - DIRECT_WEB
          - NOT_DIRECT
          - NOT_DIRECT_WEB
          - OTHER
        draft:
          type: boolean
          description: Draft means the accommodation still want to have a look on
            it before sending to police
        validated:
          type: boolean
          description: Validated false means that this record has been inserted by
            the guest and the accommodation still needs to have a look into
        validatedDate:
          type: string
          description: The datetime when this record was validated by the accommodation
          format: date-time
        ageRange:
          type: string
          description: Age of the guest
          enum:
          - ADULT
          - CHILD
          - BABY
        cityTaxPrice:
          type: number
          description: City Tax Price for this guest
        cityTaxExemption:
          type: string
          description: City tax exemption for this guest
          enum:
          - TOO_YOUNG_RANGE2
          - HOSPITALISED
          - POLICE
          - DRIVER
          - TURIST_GUIDE
          - LONG_STAY
          - STUDY_RELATED
          - FESTIVALS
          - OTHER
          - HANDICAPPED
          - RESIDENCE_REASON
          - LOW_SEASON
          - EMERGENCY
          - HOSPITAL_HELPER
          - TOO_OLD
          - DISABLED_HELPER
          - HOTEL_WORKERS
          - EXEMPTION_WORKERS
          - FREQUENT_GUEST
          - WANT_NOT_PAY
          - PORTAL_PAID
          - TOO_YOUNG_RANGE1
          - WORK_STAY
          - SPIRITUAL_RETREAT
          - PET_CARE
          - INTERNATIONAL_PROTECTION
          - SEPARATED_PARENT
          - FAMILY_CAREGIVER
          - GENDER_VIOLENCE
          - PATIENT_PARENT
        cityTaxRelativeToGroup:
          type: boolean
          description: "If there is any city tax to pay, guests pays a city tax, this\
            \ flag indicates "
        systemGenerated:
          type: boolean
          description: "If true, the city tax of this guest is relative to group"
        cityRaw:
          type: string
          description: The city for colombian customer. We might accept any value
          example: Medellín
        previousCity:
          type: string
          description: The city of departure for colombian customer. We might accept
            any value
          example: Messico
        familyRelationshipType:
          type: string
          description: The family relationship with the main guest
          enum:
          - GRANDFATHER
          - GREAT_GRANDFATHER
          - GREAT_GRANDSON
          - BROTHER_IN_LAW
          - SPOUSE
          - SON
          - BROTHER
          - GRANDSON
          - FATHER_OR_MOTHER
          - NEPHEW
          - FATHER_IN_LAW
          - UNCLE
          - SON_IN_LAW_OR_DAUGHTER_IN_LAW
          - CHILD_GUARDIAN
          - OTHER
        documentSupportNumber:
          type: string
          description: The document support number
        cityPoliceCode:
          type: string
          description: "The police code of the city, if this field is filled in the\
            \ creation of the guest, the city will be loaded from this code and not\
            \ by the City value"
        birthCity:
          type: string
          description: "The city in the customer locale. If we have not yet registered\
            \ the value for the country, we might accept any value"
          example: ROMA
        district:
          type: string
          description: Province value only for spanish guests (required)
          example: Madrid
        residenceCity:
          type: string
          description: 'The city in the customer locale. '
          example: Roma
        documentType:
          type: string
          description: "The document type in the Police code of the country. ITALY:\
            \ UFFICIALE o GENERIC_IDENTITY. Call checkin/documents/{accommodation}\
            \ to know wich are enabled"
          example: Passport
    PoliceDocumentTypeCountry:
      type: object
      properties:
        id:
          type: integer
          format: int64
        country:
          type: string
          enum:
          - AF
          - AX
          - AL
          - DZ
          - AS
          - AD
          - AO
          - AI
          - AQ
          - AG
          - AR
          - AM
          - AW
          - AU
          - AT
          - AZ
          - BS
          - BH
          - BD
          - BB
          - BY
          - BE
          - BZ
          - BJ
          - BM
          - BT
          - BO
          - BQ
          - BA
          - BW
          - BV
          - BR
          - IO
          - BN
          - BG
          - BF
          - BI
          - KH
          - CM
          - CA
          - CV
          - KY
          - CF
          - TD
          - CL
          - CN
          - CX
          - CC
          - CO
          - KM
          - CG
          - CD
          - CK
          - CR
          - CI
          - HR
          - CU
          - CW
          - CY
          - CZ
          - DK
          - DJ
          - DM
          - DO
          - EC
          - EG
          - SV
          - GQ
          - ER
          - EE
          - ET
          - FK
          - FO
          - FJ
          - FI
          - FR
          - GF
          - PF
          - TF
          - GA
          - GM
          - GE
          - DE
          - GH
          - GI
          - GR
          - GL
          - GD
          - GP
          - GU
          - GT
          - GG
          - GN
          - GW
          - GY
          - HT
          - HM
          - VA
          - HN
          - HK
          - HU
          - IS
          - IN
          - ID
          - IR
          - IQ
          - IE
          - IM
          - IL
          - IT
          - JM
          - JP
          - JE
          - JO
          - KZ
          - KE
          - KI
          - KP
          - KR
          - KW
          - KG
          - LA
          - LV
          - LB
          - LS
          - LR
          - LY
          - LI
          - LT
          - LU
          - MO
          - MK
          - MG
          - MW
          - MY
          - MV
          - ML
          - MT
          - MH
          - MQ
          - MR
          - MU
          - YT
          - MX
          - FM
          - MD
          - MC
          - MN
          - ME
          - MS
          - MA
          - MZ
          - MM
          - NA
          - NR
          - NP
          - NL
          - NC
          - NZ
          - NI
          - NE
          - NG
          - NU
          - NF
          - MP
          - "NO"
          - OM
          - PK
          - PW
          - PS
          - PA
          - PG
          - PY
          - PE
          - PH
          - PN
          - PL
          - PT
          - PR
          - QA
          - RE
          - RO
          - RU
          - RW
          - BL
          - SH
          - KN
          - LC
          - MF
          - PM
          - VC
          - WS
          - SM
          - ST
          - SA
          - SN
          - RS
          - SC
          - SL
          - SG
          - SX
          - SK
          - SI
          - SB
          - SO
          - ZA
          - GS
          - SS
          - ES
          - LK
          - SD
          - SR
          - SJ
          - SZ
          - SE
          - CH
          - SY
          - TW
          - TJ
          - TZ
          - TH
          - TL
          - TG
          - TK
          - TO
          - TT
          - TN
          - TR
          - TM
          - TC
          - TV
          - UG
          - UA
          - AE
          - GB
          - US
          - UM
          - UY
          - UZ
          - VU
          - VE
          - VN
          - VG
          - VI
          - WF
          - EH
          - YE
          - ZM
          - ZW
          - XJ
        documentType:
          type: string
          enum:
          - OTHER
          - PASSPORT
          - CARDID
          - NOSHOW
          - ACMIL
          - ACSOT
          - ACUFF
          - AMMIL
          - AMSOT
          - AMUFF
          - CCMIL
          - CCSOT
          - CCUFF
          - CERID
          - CFMIL
          - CFSOT
          - CFUFF
          - CIDIP
          - DESIS
          - EIMIL
          - EISOT
          - EIUFF
          - GFMIL
          - GFSOT
          - GFTRI
          - GFUFF
          - IDELE
          - MAGIS
          - MMMIL
          - MMSOT
          - MMUFF
          - PARLA
          - PASDI
          - PASSE
          - PATEN
          - PATNA
          - PORM1
          - PORM2
          - PORM3
          - PORM4
          - PORM5
          - PPAGE
          - PPISP
          - PPSOV
          - PPUFF
          - PSAPP
          - PSFEM
          - PSFUN
          - PSISP
          - PSSOT
          - PSUFF
          - RIFUG
          - SDMIL
          - SDSOT
          - SDUFF
          - TEAMC
          - TEAOD
          - TECAM
          - TECOC
          - TEDOG
          - TEFSE
          - TEMPI
          - TENAT
          - TENAV
          - TEPOL
          - TESAE
          - TESAR
          - TESAV
          - TESCA
          - TESCS
          - TESDI
          - TESEA
          - TESIN
          - TESLP
          - TESMB
          - TESMD
          - TESMF
          - TESMG
          - TESMI
          - TESMN
          - TESMS
          - TESMT
          - TESNO
          - TESOG
          - TESPC
          - TESPI
          - TESPT
          - TESUN
          - TETEL
          - TFERD
          - TFEXD
          - VIMIL
          - VISOT
          - VIUFF
          - VVMIL
          - VVSOT
          - VVUFF
        code:
          type: string
        policeCode:
          type: string
        label:
          type: string
        priority:
          type: integer
          format: int32
        localDocument:
          type: boolean
        regex:
          type: string
        showCustomer:
          type: boolean
    ApiRoomManagementDTO:
      type: object
      properties:
        roomIds:
          type: array
          description: "The rooms to move, copy or run rules"
          items:
            type: integer
            description: "The rooms to move, copy or run rules"
            format: int64
        destinationAccommodationId:
          type: string
          description: The destination accommodation. Empty if new structure
        newAccommodationName:
          type: string
          description: The new accommodation name
        newAccommodationPlace:
          $ref: "#/components/schemas/ApiListingPlaceDTO"
    ApiRoomManagementBasicDTO:
      type: object
      properties:
        roomIds:
          type: array
          description: "The rooms to move, copy or run rules"
          items:
            type: integer
            description: "The rooms to move, copy or run rules"
            format: int64
    ApiRoomRateDTOV3:
      required:
      - accommodationId
      - adults
      - bookingEngine
      - breakfastIncluded
      - calendar
      - closeNextDays
      - manualReservations
      - notRefundable
      - rateName
      - rmsDerived
      - statistic
      - website
      type: object
      properties:
        id:
          type: integer
          description: The id of this room rate
          format: int64
          readOnly: true
          example: 17
        name:
          type: string
          description: Name of this room rate
          example: Double room
        headline:
          type: object
          additionalProperties:
            type: string
            description: "Selling name (presented to booking engine customers), of\
              \ the main tipology or the derived rate"
            example: "{\"EN\":\"Double Room\"}"
          description: "Selling name (presented to booking engine customers), of the\
            \ main tipology or the derived rate"
          example:
            EN: Double Room
        basicName:
          type: object
          properties:
            emptyValues:
              type: boolean
            empty:
              type: boolean
          additionalProperties:
            type: string
            description: Typology Name - this will be kept by default for each potential
              derived rate
            example: "{\"EN\":\"These are the LanguageMap value in English!\"}"
            default: "{\"EN\":\"These are the access rule in English!\"}"
          description: Typology Name - this will be kept by default for each potential
            derived rate
          example:
            EN: These are the LanguageMap value in English!
          default:
            EN: These are the access rule in English!
        rateName:
          type: object
          additionalProperties:
            type: string
            description: Room/Apartment Name - Acts as rate name if you have entered
              an headline. This is useful only if you do not have specified the rate
              plans
            example: Not Refundable
            deprecated: true
          description: Room/Apartment Name - Acts as rate name if you have entered
            an headline. This is useful only if you do not have specified the rate
            plans
          example: Not Refundable
          deprecated: true
        labels:
          $ref: "#/components/schemas/LanguageMap"
        infants:
          type: integer
          description: Number of maximum infants
          format: int32
        dormitory:
          type: boolean
          description: "(*Required only in main tipology) If true, this value means\
            \ that this room/listing has to be considered as a dormitory room"
        notRefundable:
          type: boolean
          description: True if this room is not refundable. Currently is going to
            be replaced by the rate plans for newer accounts
          deprecated: true
        breakfastIncluded:
          type: boolean
          description: True if breakfast is included. Currently is going to be replaced
            by the rate plans for newer accounts
          deprecated: true
        statistic:
          type: boolean
          description: "If true this product should be considered in statistics (occupancy,etc..)"
        calendar:
          type: boolean
          description: If true this product should be visible in our calendar
        website:
          type: boolean
          description: If true this product should be visible in the generated website
            for the property
        bookingEngine:
          type: boolean
          description: If true this product should be visible in the generated booking
            engine (engine for reservations) for the property
        manualReservations:
          type: boolean
          description: If true this product should be visible in the manual reservations
            when the property search for rooms
        quantity:
          minimum: 1
          type: integer
          description: How many rooms are sellable? Keep care! This value might impact
            availability
          format: int32
          default: 1
        bathroomQuantity:
          type: integer
          description: "Number of available bathroom, the number of the bathrooms\
            \ will be automatically calculated in the SubRooms"
          format: int32
          deprecated: true
        bedroomQuantity:
          type: integer
          description: "Number of available bedroom, the number of the bedrooms will\
            \ be automatically calculated in the SubRooms"
          format: int32
          deprecated: true
        bedQuantity:
          type: integer
          description: "Number of available BEDS, the number of the beds will be automatically\
            \ calculated in the SubRooms"
          format: int32
          deprecated: true
        squareMetersSize:
          minimum: 10.0
          type: integer
          description: Square meters of this room
          format: int32
          example: 23
        legalIdIssuer:
          type: string
          description: 'The issuer of the legal id (@see legal id) '
          example: "State of New York, tourism office"
        legalId:
          type: string
          description: Legal id if needed for this room/listing. It could be the region/country/other
            institution license
          example: MC123FG1
        minimumSellingPrice:
          minimum: 10.0
          type: number
          description: Minimum selling price if price is missing
          example: 100.23
        derivedRule:
          $ref: "#/components/schemas/DerivedRule"
        location:
          $ref: "#/components/schemas/ApiListingPlaceDTO"
        description:
          type: object
          additionalProperties:
            type: string
            description: Description to show to customers inside our Booking Engine
            example: "{\"EN\":\"Double Room is a nice room, book it now!\"}"
          description: Description to show to customers inside our Booking Engine
          example:
            EN: "Double Room is a nice room, book it now!"
        wifi:
          type: object
          additionalProperties:
            type: string
            description: Wifi suggestion for the property
          description: Wifi suggestion for the property
        nearInfo:
          type: object
          additionalProperties:
            type: string
            description: Near to information
          description: Near to information
        guestInfo:
          type: object
          additionalProperties:
            type: string
            description: General information for guests for this room
          description: General information for guests for this room
        invoiceInfo:
          type: object
          additionalProperties:
            type: string
            description: Invoice information to add to any invoice that use this room
          description: Invoice information to add to any invoice that use this room
        checkinInfo:
          type: object
          additionalProperties:
            type: string
            description: Information for guest checkin
          description: Information for guest checkin
        activitiesInfo:
          type: object
          additionalProperties:
            type: string
            description: Information on activities near the accommodation
          description: Information on activities near the accommodation
        closeNextDays:
          type: integer
          description: "This option, as well as the CutOff days, aims to avoid last\
            \ minute reservations: every day, at midnight, the system will put the\
            \ rate in Stop Sale for a number of days corresponding to the value entered!"
          format: int32
          default: 0
        openNextDays:
          type: integer
          description: "This option, will remove the Stop Sell, for a date after X+1\
            \ every day. Zero for shut it down"
          format: int32
        adults:
          type: integer
          description: Adults quantity
          format: int32
        guestsDormitory:
          type: integer
          description: Guests number in dormitory mode
          format: int32
        children:
          type: integer
          description: Children quantity
          format: int32
        policeCode:
          type: integer
          description: Police Room / Apartment code
          format: int64
        ratePlans:
          type: array
          description: "List of rateplans accepted by the Room. Used mainly in Booking\
            \ Engine only. For specific functionality of this field, try on the frontend\
            \ using also the booking engine. For Channel connectivity, you can ignore"
          items:
            $ref: "#/components/schemas/ApiRateDTO"
        roomAmenities:
          type: array
          description: "The amenities to to use for the Booking Engine. For a complete\
            \ list of amenities code, refer to rest/v1/meta/octorateAmenities endpoint"
          items:
            $ref: "#/components/schemas/ApiRoomAmenityDTO"
        icalUrls:
          type: array
          description: "With the iCal connection, Octorate is enabled to check the\
            \ ics data in order to create correspondence: dates will be synchronized,\
            \ so that all the dates mistakenly open will then be closed. Reservations\
            \ and availabilities will then be synced. "
          items:
            type: string
            description: "With the iCal connection, Octorate is enabled to check the\
              \ ics data in order to create correspondence: dates will be synchronized,\
              \ so that all the dates mistakenly open will then be closed. Reservations\
              \ and availabilities will then be synced. "
        cancellationPolicyId:
          type: integer
          description: "Link a cancellation policy. It can be used only with the old\
            \ system where as we do not support rate plans. In case of rateplans,\
            \ directly link the rate plan with the cancel policy"
          format: int64
          example: 32
        paymentPolicyId:
          type: integer
          description: "Link a payment policy. It can be used only with the old system\
            \ where as we do not support rate plans. In case of rateplans, directly\
            \ link the rate plan with the paymeny policy"
          format: int64
          example: 12
        notificationEmail:
          type: string
          description: Email where Octorate shall send notifications about this room
        tripleThePrice:
          type: boolean
          description: "By activating this option, Octorate will triplicate the room\
            \ price as soon as there will be 0 availability on the calendar. This\
            \ feature is very useful to avoid overbooking if you manage OTAs that\
            \ need allotment. Warning: if you get a cancellation, regular price needs\
            \ to be set manually."
        roomCategory:
          type: string
          description: The room categorization
          example: KING
          enum:
          - STANDARD
          - SINGLE
          - QUEEN
          - KING
          - TWIN
          - HOLLYWOOD_TWIN
          - DOUBLE_DOUBLE
          - STUDIO
          - DELUXE
          - JOINT
          - CONNECTING
          - SUITE
          - APARTMENT
          - ACCESIBLE
          - CABANA
          - VILLA
          - PENTHOUSE
        rmsDerived:
          type: boolean
          description: Indicate if this room is rms derived
        accommodationId:
          type: string
          description: Id of the accommodation of this room
          example: "999999"
        hideRooms:
          type: array
          description: Rooms hidden by this room
          example:
          - 12345
          - 67889
          items:
            type: integer
            description: Rooms hidden by this room
            format: int64
        getiCalRandomName:
          type: string
          description: The iCal random name
        revenueActive:
          type: boolean
          description: TRUE if automatic price increase is enabled
        revenueMinPrice:
          type: integer
          description: The minimum price if automatic price increase is enabled
          format: int32
        revenueMaxPrice:
          type: integer
          description: The maximum price if automatic price increase is enabled
          format: int32
        revenueMaxIncrementPercent:
          type: boolean
          description: TRUE if automatic price increase is by percentage
        revenueMaxIncrement:
          type: integer
          description: The increment step if automatic price increase is enabled
          format: int32
        preferredCheckinClerk:
          type: integer
          description: The preferred checkin clerk
          format: int64
          example: 123
        preferredCheckoutClerk:
          type: integer
          description: The preferred checkout clerk
          format: int64
          example: 456
        preferredHousekeeperClerk:
          type: integer
          description: The preferred housekeeper clerk
          format: int64
          example: 789
        roomMaintenances:
          type: array
          description: The room maintenances of this room
          items:
            $ref: "#/components/schemas/ApiRoomMaintenanceDTO"
        frontName:
          $ref: "#/components/schemas/LanguageMap"
        aggregateChildren:
          type: array
          description: List of children that are in this suite
          items:
            $ref: "#/components/schemas/ApiRoomRateDTOV3"
        images:
          type: array
          description: "Images Linked to this room. Read only, for upload use dedicated\
            \ endpoint"
          readOnly: true
          items:
            type: string
            description: "Images Linked to this room. Read only, for upload use dedicated\
              \ endpoint"
            readOnly: true
        subRooms:
          type: array
          description: The list of the subrooms of this room
          items:
            $ref: "#/components/schemas/ApiSubRoom"
        showSubroomDetail:
          type: boolean
          description: True to show the list of the subrooms in the BE
        nrua:
          type: string
          description: VAU code
        amenities:
          type: array
          items:
            $ref: "#/components/schemas/ApiAmenity"
        tripeThePrice:
          type: boolean
      readOnly: true
  securitySchemes:
    OAuthLogin:
      type: oauth2
      description: "When you're interacting with an Accommodation/Network you should\
        \ use this access. <br/>Octorate default authentication model to access all\
        \ the resources relative to an Accommodation. <br/>One token = 1 property\
        \ or the network properties of the ones user has visibility.  [More info]\
        \ https://partner.octorate.com/integration/showcases/authentication.html"
      name: Authorization
      in: header
      flows:
        authorizationCode:
          authorizationUrl: https://admin.octorate.com/octobook/identity/oauth.xhtml
          tokenUrl: https://api.octorate.com/connect/rest/v1/identity/token
          refreshUrl: https://api.octorate.com/connect/rest/v1/identity/refresh
          scopes:
            any: any
    ApiOperations:
      type: oauth2
      description: Token to be used ONLY to operations like creating new properties.
        It's granted from /rest/identity/apilogin to perform Api Only operations like
        creating new properties or everything that's not requires grants from an Octorate
        customer
      name: Authorization
      in: header
      bearerFormat: Bearer
      flows:
        clientCredentials:
          tokenUrl: https://api.octorate.com/connect/rest/v1/identity/apilogin
