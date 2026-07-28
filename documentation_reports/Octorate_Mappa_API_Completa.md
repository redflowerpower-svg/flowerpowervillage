# Mappa Completa API Octorate — Controllo Totale

Documento generato automaticamente dalla spec `openapi.yaml`. Per ogni area: elenco endpoint, metodo, parametri e campi scrivibili (dove presenti).


## Auth: Identities  (3 endpoint)

### `POST /rest/v1/identity/migrate`
- **Descrizione:** Migrate Old
- **Parametri:** key(header)
- **Campi body:** accommodation

### `POST /rest/v1/identity/refresh`
- **Descrizione:** Refresh the current token. General Usage: All methods that have the properties inside or something r
- **Campi body:** client_id, client_secret, refresh_token, notes

### `POST /rest/v1/identity/token`
- **Descrizione:** Properties Token
- **Campi body:** client_id, client_secret, code, redirect_uri, code_challenge, grant_type


## ARI: Calendar  (3 endpoint)

### `POST /rest/v1/calendar/bulk`
- **Descrizione:** Update Calendar (ARI)

### `GET /rest/v1/calendar/{accommodation}/{productId}/availabilityCheck`
- **Descrizione:** Perform a check for availability on Octorate Platform. The response is based on all the preference o
- **Parametri:** accommodation(path), productId(path), startDate(query), endDate(query)

### `GET /rest/v1/calendar/{accommodation}`
- **Descrizione:** Read the calendar data
- **Parametri:** accommodation(path), product[](query), dateFrom(query), dateTo(query), size(query), page(query)


## Property: Reservations  (19 endpoint)

### `POST /rest/v1/reservation/{accommodation}/{id}/extras`
- **Descrizione:** Add to an existing reservation the list of the extra provided.
- **Parametri:** id(path), accommodation(path)
- **Campi body (schema: `ApiExtras`):** extras

### `POST /rest/v1/reservation/{accommodation}/{id}/payment`
- **Descrizione:** Add a payment to the reservation. This is not the credit card debit
- **Parametri:** id(path), accommodation(path)
- **Campi body (schema: `ApiReservationPaymentDTO`):** refundedAmount, status, id, invoiceId, reservationRoom, transaction, creditCard, paymentStep, paymentStepTitle, insertTime, referenceTime, chargeTime, preauthExpiration, description, paymentMode, source, amount, cityTaxAmount, user, scheduledTime, scheduledAmount, scheduledError, type, paypalResponsePresent, expired, waiting, scheduled, authenticated, refundable, scheduledRetry, authenticatePaymentParam, refundRetry, paymentStepRefundAfterDays, stopCron, payoffs

### `POST /rest/v1/reservation/bulk/{accommodation}`
- **Descrizione:** Create Bulk reservations
- **Parametri:** accommodation(path)
- **Campi body (schema: `ApiBulkReservation`):** reservations

### `GET /rest/v1/reservation/{accommodation}`
- **Descrizione:** findReservations
- **Parametri:** accommodation(path), ids[](query), product(query), products[](query), pms(query), pmsProduct(query), source(query), status(query), excludedSources(query), groupResults(query), sortBy(query), refer(query), type(query), startDate(query), endDate(query), referIsExclusive(query), agency(query), effectiveCheckedIn(query), effectiveCheckedOut(query), fields(query), size(query), page(query)

### `POST /rest/v1/reservation/{accommodation}`
- **Descrizione:** Create a new Reservation
- **Parametri:** availability(query), accommodation(path)
- **Campi body (schema: `ApiReservationReqDTO`):** status, refer, guests, privateNotes, roomCode, channelRefer, channelId, product, pmsProduct, checkin, checkout, effectiveCheckin, effectiveCheckout, createTime, updateTime, roomGross, totalGuest, totalChildren, totalInfants, channelNotes, metaData, guest, externalRefer, reservationExternal, api, zip, totalPaid, cleaningFee, place, city, address, country, cityTaxExemption, cityTaxPrice, draft, validated, validatedDate, internalId, externalId, systemGenerated, taxIncluded, notRefundable, loyaltyDiscount, externalDiscountId, extraIncluded, internalRate, cityTaxAmountInPayment, companyCollect, daily, json, streamFromAccommodation, related, streamCard, cityTaxZero, propertyReference, octorateId, pushImportId, cancelPenality, paymentMode, connectionId, count, currency, extra, groupName, ratePlanId, paymentExpiration, ratePlanVariation, houseKeepingNotes, tagLabel, agencyId, invoiceHolderId, noteTime, purpose, roomLocked, checkinClerk, checkoutClerk, housekeeperClerk, deposit, technicalCreditCardChange, reservationSplitStream, groupNotes, flight, policeGuests, color, groupId, completed

### `DELETE /rest/v1/reservation/{accommodation}/{id}/extra/group/{externalId}`
- **Descrizione:** Delete an extra of reservation given
- **Parametri:** id(path), accommodation(path), externalId(path)

### `PUT /rest/v1/reservation/{accommodation}/{id}/extra/{extraId}`
- **Descrizione:** Update an existing reservation
- **Parametri:** id(path), accommodation(path), extraId(path)
- **Campi body (schema: `ApiExtraDetailDTO`):** id, product, price, quantity, day, url, externalId, createDate, productionDate, invoiced, group, manual, localDay

### `DELETE /rest/v1/reservation/{accommodation}/{id}/extra/{extraId}`
- **Descrizione:** Delete an extra of reservation given
- **Parametri:** id(path), accommodation(path), extraId(path)

### `DELETE /rest/v1/reservation/{accommodation}/group/{refer}`
- **Descrizione:** Delete a group of reservations, sharing the same refer. (Multiroom reservations) (This method can be
- **Parametri:** accommodation(path), refer(path)

### `PUT /rest/v1/reservation/{accommodation}/{id}/payment/{paymentId}`
- **Descrizione:** Update a payment in the reservation
- **Parametri:** id(path), accommodation(path), paymentId(path)
- **Campi body (schema: `ApiReservationPaymentDTO`):** refundedAmount, status, id, invoiceId, reservationRoom, transaction, creditCard, paymentStep, paymentStepTitle, insertTime, referenceTime, chargeTime, preauthExpiration, description, paymentMode, source, amount, cityTaxAmount, user, scheduledTime, scheduledAmount, scheduledError, type, paypalResponsePresent, expired, waiting, scheduled, authenticated, refundable, scheduledRetry, authenticatePaymentParam, refundRetry, paymentStepRefundAfterDays, stopCron, payoffs

### `DELETE /rest/v1/reservation/{accommodation}/{id}/payment/{paymentId}`
- **Descrizione:** Update a payment in the reservation
- **Parametri:** id(path), accommodation(path), paymentId(path)

### `GET /rest/v1/reservation/{accommodation}/{id}`
- **Descrizione:** Retrieve an existing reservation. Deprecated. Use the GET of many reservations with ID param
- **Parametri:** accommodation(path), id(path)

### `PUT /rest/v1/reservation/{accommodation}/{id}`
- **Descrizione:** Update an existing reservation
- **Parametri:** id(path), accommodation(path), availability(query)
- **Campi body (schema: `ApiReservationReqDTO`):** status, refer, guests, privateNotes, roomCode, channelRefer, channelId, product, pmsProduct, checkin, checkout, effectiveCheckin, effectiveCheckout, createTime, updateTime, roomGross, totalGuest, totalChildren, totalInfants, channelNotes, metaData, guest, externalRefer, reservationExternal, api, zip, totalPaid, cleaningFee, place, city, address, country, cityTaxExemption, cityTaxPrice, draft, validated, validatedDate, internalId, externalId, systemGenerated, taxIncluded, notRefundable, loyaltyDiscount, externalDiscountId, extraIncluded, internalRate, cityTaxAmountInPayment, companyCollect, daily, json, streamFromAccommodation, related, streamCard, cityTaxZero, propertyReference, octorateId, pushImportId, cancelPenality, paymentMode, connectionId, count, currency, extra, groupName, ratePlanId, paymentExpiration, ratePlanVariation, houseKeepingNotes, tagLabel, agencyId, invoiceHolderId, noteTime, purpose, roomLocked, checkinClerk, checkoutClerk, housekeeperClerk, deposit, technicalCreditCardChange, reservationSplitStream, groupNotes, flight, policeGuests, color, groupId, completed

### `DELETE /rest/v1/reservation/{accommodation}/{id}`
- **Descrizione:** Delete a reservation (This method can be used as alternative of update reservation to create a cance
- **Parametri:** accommodation(path), id(path)

### `PATCH /rest/v1/reservation/{accommodation}/{id}`
- **Descrizione:** Partially update an existing reservation. Only the fields included in the request body are updated; 
- **Parametri:** id(path), accommodation(path)
- **Campi body (schema: `ApiReservationReqDTO`):** status, refer, guests, privateNotes, roomCode, channelRefer, channelId, product, pmsProduct, checkin, checkout, effectiveCheckin, effectiveCheckout, createTime, updateTime, roomGross, totalGuest, totalChildren, totalInfants, channelNotes, metaData, guest, externalRefer, reservationExternal, api, zip, totalPaid, cleaningFee, place, city, address, country, cityTaxExemption, cityTaxPrice, draft, validated, validatedDate, internalId, externalId, systemGenerated, taxIncluded, notRefundable, loyaltyDiscount, externalDiscountId, extraIncluded, internalRate, cityTaxAmountInPayment, companyCollect, daily, json, streamFromAccommodation, related, streamCard, cityTaxZero, propertyReference, octorateId, pushImportId, cancelPenality, paymentMode, connectionId, count, currency, extra, groupName, ratePlanId, paymentExpiration, ratePlanVariation, houseKeepingNotes, tagLabel, agencyId, invoiceHolderId, noteTime, purpose, roomLocked, checkinClerk, checkoutClerk, housekeeperClerk, deposit, technicalCreditCardChange, reservationSplitStream, groupNotes, flight, policeGuests, color, groupId, completed

### `DELETE /rest/v1/reservation/{reservationId}/split`
- **Descrizione:** Delete a created split
- **Parametri:** reservationId(path)

### `GET /rest/v1/reservation/{accommodation}/search`
- **Descrizione:** Booking Engine Search
- **Parametri:** accommodation(path), ids[](query), checkin(query), checkout(query), currency(query), availcheck(query)

### `GET /rest/v1/reservation/search/hotel`
- **Descrizione:** Search rooms for a specific hotel, considering various filter options (adults, children, availabilit
- **Parametri:** id(query), checkin(query), checkout(query), currency(query), ids[](query), adults(query), children(query), availcheck(query), applyDiscount(query), showHidden(query), showRates(query), ignoreGreaterPax(query), showLowerOccupancyResult(query)

### `POST /rest/v1/reservation/{accommodation}/{reservationId}/split`
- **Descrizione:** Split the reservation in two parts
- **Parametri:** reservationId(path), accommodation(path)
- **Campi body (schema: `ApiReservationSplit`):** splitRoom, splitAccommodation, connection, splitStart


## Webhook Subscriptions  (5 endpoint)

### `POST /rest/v1/subscription/{event}`
- **Descrizione:** Create a new subscription (webhook). You can configure webhook endpoints via the API to be notified 
- **Parametri:** event(path)
- **Campi body:** url

### `PUT /rest/v1/subscription/{id}`
- **Descrizione:** Update the current subscription
- **Parametri:** id(path), url(query)

### `DELETE /rest/v1/subscription/{id}`
- **Descrizione:** Delete an existing subscription
- **Parametri:** id(path)

### `GET /rest/v1/subscription/list`
- **Descrizione:** Retrieve the supported subscriptions

### `GET /rest/v1/subscription`
- **Descrizione:** Retrieve actived subscriptions


## ARI: Rooms & Rates  (23 endpoint)

### `POST /rest/v1/roomrates/{accommodation}`
- **Descrizione:** create a room or a rate
- **Parametri:** accommodation(path)
- **Campi body (schema: `ApiRoomDTO`):** name, id, headline, basicName, rateName, sellingName, labels, infants, dormitory, notRefundable, breakfastIncluded, statistic, calendar, website, bookingEngine, manualReservations, quantity, bathroomQuantity, bedroomQuantity, bedQuantity, squareMetersSize, legalIdIssuer, legalId, minimumSellingPrice, derivedRule, location, description, wifi, nearInfo, guestInfo, invoiceInfo, tripeThePrice, closeNextDays, openNextDays, adults, guestsDormitory, children, policeCode, ratePlans, amenities, icalUrls, cancellationPolicyId, paymentPolicyId, notificationEmail, tripleThePrice, roomCategory, rmsDerived, accommodationId, hideRooms, getiCalRandomName, revenueActive, revenueMinPrice, revenueMaxPrice, revenueMaxIncrementPercent, revenueMaxIncrement, preferredCheckinClerk, preferredCheckoutClerk, preferredHousekeeperClerk, roomMaintenances, subRooms, showSubroomDetail, nrua, roomAmenities, activitiesInfo, headlineLangMap, descriptionLangMap, checkinInfo

### `POST /rest/v1/roomrates/{accommodation}/{product}/suite`
- **Descrizione:** Aggregate rooms in order to create a suite: Let the availability be the same between many rooms. You
- **Parametri:** accommodation(path), product(path), children[](query)

### `DELETE /rest/v1/roomrates/{accommodation}/{productId}/image`
- **Descrizione:** Delete The provided image
- **Parametri:** accommodation(path), productId(path)

### `DELETE /rest/v1/roomrates/{accommodation}/{productId}/pmsRoomImage/{pmsRoomImageId}`
- **Descrizione:** Delete The provided pms room image
- **Parametri:** accommodation(path), productId(path), pmsRoomImageId(path)

### `DELETE /rest/v1/roomrates/{accommodation}/{productId}`
- **Descrizione:** Delete a product (room or rate)
- **Parametri:** accommodation(path), productId(path)

### `DELETE /rest/v1/roomrates/{accommodation}/{productId}/image/{imageId}`
- **Descrizione:** Delete The provided image
- **Parametri:** accommodation(path), productId(path), imageId(path)

### `GET /rest/v1/roomrates/{accommodation}/{roomid}`
- **Parametri:** accommodation(path), roomid(path)

### `PATCH /rest/v1/roomrates/{accommodation}/{roomid}/translateMissingDescriptions/{language}`
- **Descrizione:** Translate the missing descriptions of the room reading from the provided language
- **Parametri:** accommodation(path), roomid(path), language(path)

### `PATCH /rest/v1/roomrates/{accommodation}/{id}`
- **Descrizione:** Update the specified room or a rate
- **Parametri:** accommodation(path), id(path)

### `POST /rest/v2/roomrates/{accommodation}/copy`
- **Descrizione:** Manage rooms - Copy rooms
- **Parametri:** accommodation(path)
- **Campi body (schema: `ApiRoomManagementDTO`):** roomIds, destinationAccommodationId, newAccommodationName, newAccommodationPlace

### `GET /rest/v2/roomrates/{accommodation}/connections`
- **Descrizione:** Retrieve rooms connections
- **Parametri:** accommodation(path), ids[](query), page(query), size(query), includeRms(query)

### `GET /rest/v2/roomrates/{accommodation}`
- **Descrizione:** Retrieve property rooms and rates
- **Parametri:** accommodation(path), fields(query), ids[](query), page(query), size(query), includeRms(query)

### `POST /rest/v2/roomrates/{accommodation}/move`
- **Descrizione:** Manage rooms - Move rooms
- **Parametri:** accommodation(path)
- **Campi body (schema: `ApiRoomManagementDTO`):** roomIds, destinationAccommodationId, newAccommodationName, newAccommodationPlace

### `POST /rest/v2/roomrates/{accommodation}/runRules`
- **Descrizione:** Run rules for a list of rooms
- **Parametri:** accommodation(path)
- **Campi body (schema: `ApiRoomManagementBasicDTO`):** roomIds

### `PATCH /rest/v2/roomrates/{accommodationId}/{roomRateId}`
- **Descrizione:** Update the room rate
- **Parametri:** accommodationId(path), roomRateId(path)

### `POST /rest/v3/roomrates/{accommodation}/copy`
- **Descrizione:** Manage rooms - Copy rooms
- **Parametri:** accommodation(path)
- **Campi body (schema: `ApiRoomManagementDTO`):** roomIds, destinationAccommodationId, newAccommodationName, newAccommodationPlace

### `GET /rest/v3/roomrates/{accommodation}`
- **Descrizione:** Retrieve property rooms and rates
- **Parametri:** accommodation(path), fields(query), ids[](query), page(query), size(query), includeRms(query)

### `POST /rest/v3/roomrates/{accommodation}`
- **Descrizione:** create a room or a rate
- **Parametri:** accommodation(path)
- **Campi body (schema: `ApiRoomRateDTOV3`):** id, name, headline, basicName, rateName, labels, infants, dormitory, notRefundable, breakfastIncluded, statistic, calendar, website, bookingEngine, manualReservations, quantity, bathroomQuantity, bedroomQuantity, bedQuantity, squareMetersSize, legalIdIssuer, legalId, minimumSellingPrice, derivedRule, location, description, wifi, nearInfo, guestInfo, invoiceInfo, checkinInfo, activitiesInfo, closeNextDays, openNextDays, adults, guestsDormitory, children, policeCode, ratePlans, roomAmenities, icalUrls, cancellationPolicyId, paymentPolicyId, notificationEmail, tripleThePrice, roomCategory, rmsDerived, accommodationId, hideRooms, getiCalRandomName, revenueActive, revenueMinPrice, revenueMaxPrice, revenueMaxIncrementPercent, revenueMaxIncrement, preferredCheckinClerk, preferredCheckoutClerk, preferredHousekeeperClerk, roomMaintenances, frontName, aggregateChildren, images, subRooms, showSubroomDetail, nrua, amenities, tripeThePrice

### `GET /rest/v3/roomrates/{accommodation}/connections`
- **Descrizione:** Retrieve rooms connections
- **Parametri:** accommodation(path), ids[](query), page(query), size(query), includeRms(query)

### `POST /rest/v3/roomrates/{accommodation}/move`
- **Descrizione:** Manage rooms - Move rooms
- **Parametri:** accommodation(path)
- **Campi body (schema: `ApiRoomManagementDTO`):** roomIds, destinationAccommodationId, newAccommodationName, newAccommodationPlace

### `POST /rest/v3/roomrates/{accommodation}/runRules`
- **Descrizione:** Run rules for a list of rooms
- **Parametri:** accommodation(path)
- **Campi body (schema: `ApiRoomManagementBasicDTO`):** roomIds

### `PATCH /rest/v3/roomrates/{accommodation}/{roomid}/translateMissingDescriptions/{language}`
- **Descrizione:** Translate the missing descriptions of the room reading from the provided language
- **Parametri:** accommodation(path), roomid(path), language(path)
- **Campi body (schema: `ApiRoomRateDTOV3`):** id, name, headline, basicName, rateName, labels, infants, dormitory, notRefundable, breakfastIncluded, statistic, calendar, website, bookingEngine, manualReservations, quantity, bathroomQuantity, bedroomQuantity, bedQuantity, squareMetersSize, legalIdIssuer, legalId, minimumSellingPrice, derivedRule, location, description, wifi, nearInfo, guestInfo, invoiceInfo, checkinInfo, activitiesInfo, closeNextDays, openNextDays, adults, guestsDormitory, children, policeCode, ratePlans, roomAmenities, icalUrls, cancellationPolicyId, paymentPolicyId, notificationEmail, tripleThePrice, roomCategory, rmsDerived, accommodationId, hideRooms, getiCalRandomName, revenueActive, revenueMinPrice, revenueMaxPrice, revenueMaxIncrementPercent, revenueMaxIncrement, preferredCheckinClerk, preferredCheckoutClerk, preferredHousekeeperClerk, roomMaintenances, frontName, aggregateChildren, images, subRooms, showSubroomDetail, nrua, amenities, tripeThePrice

### `PATCH /rest/v3/roomrates/{accommodation}/{id}`
- **Descrizione:** Update the specified room or a rate
- **Parametri:** accommodation(path), id(path)


## ARI: RatePlan Info  (4 endpoint)

### `PUT /rest/v1/rateplans/{accommodation}/{id}`
- **Descrizione:** Update a rate plan
- **Parametri:** accommodation(path), id(path)
- **Campi body (schema: `ApiRateDTO`):** id, internalLabel, label, title, description, treatment, accommodationId, ratePlanDates, roomIds, priceModel, price, showPrices, paymentPolicy, cancellationPolicy, extras, priority, accommodationName

### `DELETE /rest/v1/rateplans/{accommodation}/{id}`
- **Descrizione:** Delete a rate plan
- **Parametri:** accommodation(path), id(path)

### `GET /rest/v1/rateplans/{accommodation}`
- **Descrizione:** Retrieve the rate plans labels
- **Parametri:** accommodation(path), checkMultiaccount(query), fields(query), ids[](query)

### `POST /rest/v1/rateplans/{accommodation}`
- **Descrizione:** Update a rate plan
- **Parametri:** accommodation(path)
- **Campi body (schema: `ApiRateDTO`):** id, internalLabel, label, title, description, treatment, accommodationId, ratePlanDates, roomIds, priceModel, price, showPrices, paymentPolicy, cancellationPolicy, extras, priority, accommodationName


## Property: Guests  (4 endpoint)

### `GET /rest/v1/guests/{accommodationId}/{guestId}`
- **Descrizione:** Retrieve the guest with the provided id
- **Parametri:** accommodationId(path), guestId(path)

### `PUT /rest/v1/guests/{accommodationId}/{guestId}`
- **Descrizione:** Update an existing Guest
- **Parametri:** accommodationId(path), guestId(path)

### `GET /rest/v1/guests/{accommodationId}/list`
- **Descrizione:** Retrieve the guests according to the provided filters
- **Parametri:** accommodationId(path), categories[](query), guestName(query), fields(query), size(query), page(query)

### `POST /rest/v1/guests/{accommodationId}`
- **Descrizione:** Insert a new Guest
- **Parametri:** accommodationId(path)


## Property: Payments  (6 endpoint)

### `POST /rest/v1/payment/OCTORATE/{otaName}/addCard`
- **Descrizione:** Add Card
- **Parametri:** otaName(path)

### `GET /rest/v1/payment/{propertyId}/register`
- **Descrizione:** Card PIN Status
- **Parametri:** propertyId(path), copyNetwork(query)

### `POST /rest/v1/payment/{propertyId}/register`
- **Descrizione:** Register Card PIN
- **Parametri:** propertyId(path)

### `DELETE /rest/v1/payment/{accommodationId}/{paymentId}`
- **Descrizione:** Delete the payment with the provided id
- **Parametri:** accommodationId(path), paymentId(path)

### `GET /rest/v1/payment/{reservationId}/detokenize`
- **Descrizione:** Detokenize/Show Card
- **Parametri:** reservationId(path), language(query), askCvv(query)

### `PATCH /rest/v1/payment/{accommodationId}/{paymentId}/move`
- **Descrizione:** Move the payment with the provided id to the reservation with the provided id
- **Parametri:** accommodationId(path), paymentId(path), reservationId(query)


## Property: Checkins  (7 endpoint)

### `PUT /rest/v1/checkin/{accommodation}/{reservationId}/guest/{guestId}`
- **Descrizione:** Update an existing guest inside the reservation. Guest here is the detailed information retrieved du
- **Parametri:** reservationId(path), accommodation(path), guestId(path)
- **Campi body (schema: `ApiReservationGuestDTO`):** id, type, accommodatedType, source, givenName, familyName, customerName, checkin, checkout, birthDate, birthCountry, birthCity, residenceCountry, city, email, phone, phoneAvailable, emailAvailable, skipContactInfo, address, zipCode, language, documentCode, documentType, documentIssueDate, documentIssuePlace, nationality, documentExpire, sex, addressLine1, addressLine2, policeSentTime, policeSentStatus, invoiceAgency, excludeCityTax, excludeCityTaxAgency, travelWay, plateNumber, tourismType, degree, travelRefer, draft, validated, validatedDate, ageRange, cityTaxPrice, cityTaxExemption, cityTaxRelativeToGroup, systemGenerated, cityRaw, previousCity, citizenship, familyRelationshipType, documentSupportNumber, cityPoliceCode

### `DELETE /rest/v1/checkin/{accommodation}/{reservationId}/guest/{guestId}`
- **Descrizione:** Delete a guest of the reservation
- **Parametri:** reservationId(path), accommodation(path), guestId(path)

### `PUT /rest/v1/checkin/{accommodation}/{reservationId}`
- **Descrizione:** Update the general status of the reservation as checked in, checked out or no show.
- **Parametri:** reservationId(path), accommodation(path), status(query)

### `POST /rest/v2/checkin/{accommodation}/{id}/guest`
- **Descrizione:** Create a new Guest inside the reservation. Guest here is the detailed information retrieved during t
- **Parametri:** id(path), accommodation(path)
- **Campi body (schema: `ApiReservationGuestDTO`):** id, type, accommodatedType, source, givenName, familyName, customerName, checkin, checkout, birthDate, birthCountry, birthCity, residenceCountry, city, email, phone, phoneAvailable, emailAvailable, skipContactInfo, address, zipCode, language, documentCode, documentType, documentIssueDate, documentIssuePlace, nationality, documentExpire, sex, addressLine1, addressLine2, policeSentTime, policeSentStatus, invoiceAgency, excludeCityTax, excludeCityTaxAgency, travelWay, plateNumber, tourismType, degree, travelRefer, draft, validated, validatedDate, ageRange, cityTaxPrice, cityTaxExemption, cityTaxRelativeToGroup, systemGenerated, cityRaw, previousCity, citizenship, familyRelationshipType, documentSupportNumber, cityPoliceCode

### `GET /rest/v2/checkin/{accommodation}/tags`
- **Descrizione:** Get checkin tags
- **Parametri:** accommodation(path)

### `GET /rest/v2/checkin/city/{country}`
- **Descrizione:** Get cities of a country
- **Parametri:** country(path)

### `GET /rest/v2/checkin/documents/{accommodation}`
- **Descrizione:** Get document types
- **Parametri:** accommodation(path)


## Property: Invoices  (4 endpoint)

### `POST /rest/v2/invoice/{codice}/{refer}/createDoubleHeadingInvoice`
- **Descrizione:** Creates double billing from a reservation and sends the receipts/invoices to owner and guest.
- **Parametri:** refer(path), codice(path), sendMailReceiptOwnercc(query), sendMailReceiptGuestcc(query), sendMailInvoiceGuestcc(query)

### `GET /rest/v2/invoice/pdf/{accommodationId}/summary/{idDocumentEncrypted}`
- **Descrizione:** Download the PDF of a persisted summary document
- **Parametri:** accommodationId(path), idDocumentEncrypted(path), language(query)

### `GET /rest/v2/invoice/{codice}`
- **Descrizione:** Read the invoices
- **Parametri:** fields(query), ids[](query), reservations[](query), reservationRefers[](query), customer(query), dateType(query), startDate(query), endDate(query), documentTypes[](query), paid(query), expired(query), fiscalInvoiceGroup(query), autoinvoice(query), passive(query), invoiceQuery(query), fields(query), size(query), page(query), sort(query), sortOrder(query), codice(path)

### `POST /rest/v2/invoice/{accommodationId}/summary/{refer}`
- **Descrizione:** Create and persist a summary document for a reservation, return download URL
- **Parametri:** accommodationId(path), refer(path)


## Property: Cancellation policies  (1 endpoint)

### `GET /rest/v1/policies/{accommodation}`
- **Descrizione:** Retrieve Cancellation and Payment Policies
- **Parametri:** accommodation(path)


## Property: Portal Connections  (10 endpoint)

### `POST /rest/v1/connection/{accommodation}`
- **Descrizione:** Create new connection
- **Parametri:** accommodation(path)
- **Campi body (schema: `ApiConnectionDTO`):** currency, id, channelId, channelName, accommodationId, hotelId, userLogged, updateCalendar, pullReservations, pullMappedOnly, content, mailOnError, calendarValues, username, password, loginAt, correctionRatio, correctionFixed, correctionRound, commission, messages, availabilityPercentage, portal, accommodation, newChannel, lastPortalAcceptLog, hasBasicRooms, hasPmsRooms, status, color

### `GET /rest/v1/connection/external/{accommodation}/{connection}`
- **Descrizione:** Retrieve external products
- **Parametri:** accommodation(path), connection(path)

### `POST /rest/v1/connection/external/{accommodation}/{connection}`
- **Descrizione:** Create an external product
- **Parametri:** accommodation(path), connection(path)
- **Campi body (schema: `ApiExternalRoomDTO`):** id, roomName, roomId, rateName, rateId, occupancy, manageable, pmsRoom, createTime, referenceId

### `DELETE /rest/v1/connection/{accommodation}/{connection}`
- **Descrizione:** Delete Connection
- **Parametri:** accommodation(path), connection(path)

### `PATCH /rest/v1/connection/{accommodation}/{connection}`
- **Descrizione:** Update a connection
- **Parametri:** accommodation(path), connection(path)
- **Campi body (schema: `ApiConnectionDTO`):** currency, id, channelId, channelName, accommodationId, hotelId, userLogged, updateCalendar, pullReservations, pullMappedOnly, content, mailOnError, calendarValues, username, password, loginAt, correctionRatio, correctionFixed, correctionRound, commission, messages, availabilityPercentage, portal, accommodation, newChannel, lastPortalAcceptLog, hasBasicRooms, hasPmsRooms, status, color

### `DELETE /rest/v1/connection/mapping/{accommodation}/{connection}/{mappingId}`
- **Descrizione:** Delete an existing mapping
- **Parametri:** accommodation(path), connection(path), mappingId(path)

### `POST /rest/v1/connection/{action}/{accommodation}/{connection}`
- **Descrizione:** Execute ACTION on connection
- **Parametri:** accommodation(path), connection(path), action(path)

### `GET /rest/v1/connection/mapping/{accommodation}/{connection}`
- **Descrizione:** Retrieve Mapping
- **Parametri:** connection(path), accommodation(path)

### `POST /rest/v1/connection/mapping/{accommodation}/{connection}`
- **Descrizione:** Create Mapping
- **Parametri:** accommodation(path), connection(path), product(query), externalProduct(query), query(query)

### `GET /rest/v1/connection`
- **Descrizione:** Retrieve a connection ID
- **Parametri:** name(query), accommodation(query), hotelId(query), id[](query), fields(query)


## Property: Extra/Products  (5 endpoint)

### `POST /rest/v1/extra/bulk/{accommodation}`
- **Descrizione:** Create new Extra Products
- **Parametri:** accommodation(path)

### `PUT /rest/v1/extra/{accommodation}/{productId}`
- **Descrizione:** Update a product
- **Parametri:** accommodation(path), productId(path)

### `DELETE /rest/v1/extra/{accommodation}/{productId}`
- **Descrizione:** Delete a product
- **Parametri:** accommodation(path), productId(path)

### `GET /rest/v1/extra/{accommodation}`
- **Descrizione:** Retrieve all the existing extras products
- **Parametri:** accommodation(path), id(query), sortBy(query), enabled(query), name(query), extraCategoryId(query), includeGeneratedExtra(query), includeMasterAccommodationExtras(query), accommodations[](query), fields(query), size(query), page(query)

### `PUT /rest/v1/extra/{accommodation}/updateAll`
- **Descrizione:** Update All Extra products
- **Parametri:** accommodation(path)


## Content: Portals  (20 endpoint)

### `DELETE /rest/v1/content/connections/{connection}/cancellationPolicies/{portalValue}`
- **Descrizione:** Cancellation Policy [DELETE]
- **Parametri:** connection(path), portalValue(path)

### `DELETE /rest/v1/content/connections/{connection}/contacts/{contactType}`
- **Descrizione:** Contact [DELETE]
- **Parametri:** connection(path), contactType(path)

### `DELETE /rest/v1/content/connections/{connection}/fees/{index}`
- **Descrizione:** Fee [REMOVE]
- **Parametri:** connection(path), index(path)

### `DELETE /rest/v1/content/connections/{connection}/services/{index}`
- **Descrizione:** Service [DELETE]
- **Parametri:** connection(path), index(path)

### `GET /rest/v1/content/connections/{connection}/cancellationPolicies`
- **Descrizione:** Cancellation Policies
- **Parametri:** connection(path)

### `POST /rest/v1/content/connections/{connection}/cancellationPolicies`
- **Descrizione:** Cancellation Policy [ADD]
- **Parametri:** connection(path), policy(query), ApplyOnDeposit(query)

### `POST /rest/v1/content/connections/{connection}/push`
- **Descrizione:** Final Push to Portal
- **Parametri:** connection(path)

### `GET /rest/v1/content/connections/{connection}/accommodationconf`
- **Descrizione:** Accommodation Settings
- **Parametri:** connection(path)

### `POST /rest/v1/content/connections/{connection}/accommodationconf`
- **Descrizione:** Accommodation Settings
- **Parametri:** connection(path)
- **Campi body (schema: `ExternalAccomodation`):** lastUpdate, propertyType, permissionPublish, privateOperator, roomQuantity, paymentMethods, spokenLanguages, depositPolicies, extraBeds, maxExtraBeds, bookingPetsPolicy, petsChargePaid, petsDeposit, petsNoRefundable, email, contacts, rentalAgreement, chainCode, damagePolicy, quietHours, frenchTaxDetails, invoiceSettings, externalPropertyProfile, welcomeMessage, neighborhoodInfo, ownerInfo, familyTips, propertyCheckinMethods

### `GET /rest/v1/content/connections/{connection}/contacts`
- **Descrizione:** Contacts List
- **Parametri:** connection(path)

### `POST /rest/v1/content/connections/{connection}/contacts`
- **Descrizione:** Contact ADD
- **Parametri:** connection(path)
- **Campi body (schema: `ExternalContact`):** portal, type, personName, personFamilyName, companyName, phone, male, mail, place, languageOcto, portalValue, codeType, contract, deletable, editable, propertyCharge

### `GET /rest/v1/content/connections/{connection}/extrabeds`
- **Descrizione:** Extra Beds
- **Parametri:** connection(path)

### `POST /rest/v1/content/connections/{connection}/extrabeds`
- **Descrizione:** Extra Beds [ADD]
- **Parametri:** connection(path)
- **Campi body (schema: `ApiExtraBedRequest`):** ageRestriction, quantityAvailable, price

### `GET /rest/v1/content/connections/{connection}/fees`
- **Descrizione:** Fees
- **Parametri:** connection(path)

### `POST /rest/v1/content/connections/{connection}/fees`
- **Descrizione:** Fee [ADD]
- **Parametri:** connection(path)
- **Campi body (schema: `ApiFeeRequest`):** portalValue, chargeType, amount, exclusive, category, internetType, internetCoverage, parkingType, parkingNeedReservation, parkingPublicArea

### `POST /rest/v1/content/connections/{connection}/rentalagreement`
- **Descrizione:** Rental Agreement
- **Parametri:** connection(path), url(query)

### `GET /rest/v1/content/connections/{connection}/services`
- **Descrizione:** Services
- **Parametri:** connection(path)

### `POST /rest/v1/content/connections/{connection}/services`
- **Descrizione:** Service [ADD]
- **Parametri:** connection(path)
- **Campi body (schema: `ExternalService`):** portal, portalValue, quantity, price, configuration, exists, roomLevel, acceptedBreakfast, octorateParkingDetails, octoratePaymentDetails, octorateSwimmingPoolDetails, octorateRestaurantDetails, octorateInternetDetails, octorateKidsPoolDetails, octorateOnSiteDetails, octorateAgeLimitDetails, octorateScheduleDetails, octorateTemporarilyClosedDetails, octorateSurchargeDetails, octorateMealDetails, editable, deletable, model, inclusive, codeType, breakfastApplicable, bookingChildren, extraBed, valueType, amount, propertyCharge

### `DELETE /rest/v1/content/connections/{connection}/extrabeds/{index}`
- **Descrizione:** Extra Beds [DELETE]
- **Parametri:** connection(path), index(path)

### `GET /rest/v1/content/connections/meta/{portal}`
- **Descrizione:** Read Static Portal meta
- **Parametri:** portal(path), category(query)


## Content: Rooms / Apartment  (34 endpoint)

### `POST /rest/v1/content/products/{accommodation}/addNeighborhoodod`
- **Descrizione:** Create a new description for a room/rate, replacing existing object with the one provided. This IS N
- **Parametri:** accommodation(path), productId(query), listingId(query), ownership(query), listingId(query), minWords(query), maxWords(query)
- **Campi body (schema: `ExternalDescriptions`):** directions, description, houseRules, spaceInformation, access, hostInteraction, neightboorHood, transportation, details, paymentNotes, headline

### `POST /rest/v1/content/products/{accommodation}/{productId}/addTextToField`
- **Descrizione:** Update the field with a random string. The string is loaded by the array in the req map
- **Parametri:** accommodation(path), productId(path), minWords(query), maxWords(query), field(query)

### `POST /rest/v1/content/products/{accommodation}/{productId}/addTextToHouseRules`
- **Descrizione:** Create a new description for a room/rate, replacing existing object with the one provided. This IS N
- **Parametri:** accommodation(path), productId(path), minWords(query), maxWords(query)
- **Campi body (schema: `ExternalDescriptions`):** directions, description, houseRules, spaceInformation, access, hostInteraction, neightboorHood, transportation, details, paymentNotes, headline

### `GET /rest/v1/content/products/{accommodation}/{productId}/availabilityconf`
- **Descrizione:** Retrieve the availability information
- **Parametri:** accommodation(path), productId(path)

### `POST /rest/v1/content/products/{accommodation}/{productId}/availabilityconf`
- **Parametri:** accommodation(path), productId(path)
- **Campi body (schema: `ExternalAvailabilityConf`):** airbnbCheckinCategory, checkinInstruction, advancedNotice, defaultMinStay, defaultMaxStay, weekDayCheckin, weekDayCheckout, allowRTBMaxstay

### `GET /rest/v1/content/products/{accommodation}/{productId}/descriptions`
- **Parametri:** accommodation(path), productId(path)

### `POST /rest/v1/content/products/{accommodation}/{productId}/descriptions`
- **Descrizione:** Create a new description for a room/rate, replacing existing object with the one provided. This IS N
- **Parametri:** accommodation(path), productId(path)
- **Campi body (schema: `ExternalDescriptions`):** directions, description, houseRules, spaceInformation, access, hostInteraction, neightboorHood, transportation, details, paymentNotes, headline

### `PATCH /rest/v1/content/products/{accommodation}/{productId}/descriptions`
- **Descrizione:** Update an existing description for a room/rate, avoiding cancel not provided values
- **Parametri:** accommodation(path), productId(path)
- **Campi body (schema: `ExternalDescriptions`):** directions, description, houseRules, spaceInformation, access, hostInteraction, neightboorHood, transportation, details, paymentNotes, headline

### `GET /rest/v1/content/products/{accommodation}/{productId}/fees`
- **Descrizione:** Retrieve the fees for an existing room/rate
- **Parametri:** accommodation(path), productId(path)

### `POST /rest/v1/content/products/{accommodation}/{productId}/fees`
- **Descrizione:** Create a new FEE for that room/rate
- **Parametri:** accommodation(path), productId(path)
- **Campi body (schema: `ExternalFee`):** portal, portalValue, chargeTypeValue, amount, configuration, category, taxable, internetDetails, parkingDetails, propertyCharge, airbnbFeeType, inclusive, codeType, editable, internetFee, parkingFee, deletable

### `GET /rest/v1/content/products/{accommodation}/{productId}/listing`
- **Descrizione:** Retrieve the basic listing information
- **Parametri:** accommodation(path), productId(path)

### `POST /rest/v1/content/products/{accommodation}/{productId}/listing`
- **Descrizione:** Create the listing information
- **Parametri:** accommodation(path), productId(path)
- **Campi body (schema: `ExternalListing`):** reference, externalUrl, lastEdit, homewayList, airbnbPropertyGroup, airbnbApprovalStatus, airbnbPropertyType, roomTypeCategory, roomClass, bedroomType, quantity, internalName, bathrooms, bedrooms, beds, taxId, place, personCapacity, bathroomShared, bathroomWith, country, size, floor, externalTask, bookingPropertyGroup, airbnbRoomType, airbnbEntireHome, bookingHasRoom

### `PATCH /rest/v1/content/products/{accommodation}/{productId}/listing`
- **Descrizione:** Update a listing, without clear not given fields
- **Parametri:** accommodation(path), productId(path)
- **Campi body (schema: `ExternalListing`):** reference, externalUrl, lastEdit, homewayList, airbnbPropertyGroup, airbnbApprovalStatus, airbnbPropertyType, roomTypeCategory, roomClass, bedroomType, quantity, internalName, bathrooms, bedrooms, beds, taxId, place, personCapacity, bathroomShared, bathroomWith, country, size, floor, externalTask, bookingPropertyGroup, airbnbRoomType, airbnbEntireHome, bookingHasRoom

### `POST /rest/v1/content/products/{accommodation}/{productId}/pricing`
- **Descrizione:** Update an existing *pricing* for a room/rate, setting as empty not provided values
- **Parametri:** accommodation(path), productId(path)
- **Campi body (schema: `ExternalPricing`):** pricingUpdate, securityDeposit, cleaningFee, defaultDailyPrice, weekendPrice, guestsIncluded, priceExtraPerson, priceExtraPersonType, basePrice, currency, monthlyDiscount, weeklyDiscount, discountNotRefundable, homeawayPricing, distributionModel, discounts, pricingModel, taxes, taxCollectionType, acceptToPayTaxes, acceptFirstReservationDiscount

### `PATCH /rest/v1/content/products/{accommodation}/{productId}/pricing`
- **Descrizione:** Update an existing *pricing* for a room/rate, without touching already provided values
- **Parametri:** accommodation(path), productId(path)

### `GET /rest/v1/content/products/{accommodation}/{productId}/rate`
- **Descrizione:** Retrieve the rate informations and restrictions
- **Parametri:** accommodation(path), productId(path)

### `POST /rest/v1/content/products/{accommodation}/{productId}/rate`
- **Descrizione:** Create a new rate setting up the restrictions. All not given values will be replaced with empty
- **Parametri:** accommodation(path), productId(path)
- **Campi body (schema: `ExternalRateContent`):** Name used by the property manager to identity this rate, relative ids in the external channels, last activation status for this portal. May be unavailable, in this case key of the map is missing. Key is the name of the portal in Octorate format., (Only Agoda supports it) - Type of threatment of this rate, (Only Agoda supports it) - Type of channel (Where sell this rate), (Only BookingSuite) - Relation between the parent rate (value) , (Only BookingSuite) - Relation between the parent rate (type) , (Booking.com) All the appliable rate restrictions, derived, javaId, serializedName

### `PATCH /rest/v1/content/products/{accommodation}/{productId}/rate`
- **Descrizione:** Create a new rate setting up the restrictions. All not given values will be left untouched
- **Parametri:** accommodation(path), productId(path)
- **Campi body (schema: `ExternalRateContent`):** Name used by the property manager to identity this rate, relative ids in the external channels, last activation status for this portal. May be unavailable, in this case key of the map is missing. Key is the name of the portal in Octorate format., (Only Agoda supports it) - Type of threatment of this rate, (Only Agoda supports it) - Type of channel (Where sell this rate), (Only BookingSuite) - Relation between the parent rate (value) , (Only BookingSuite) - Relation between the parent rate (type) , (Booking.com) All the appliable rate restrictions, derived, javaId, serializedName

### `POST /rest/v1/content/products/{accommodation}/{productId}/reservation`
- **Descrizione:** Update reservation settings for a room/rate, replacing all the existing values (not given will be cl
- **Parametri:** accommodation(path), productId(path)
- **Campi body (schema: `ExternalReservationConf`):** childrenAllowed, childrenQuantity, childrenMaxAge, childrenExtraPrice, noChildrenReason, smokersAllowed, petsAllowed, eventsAllowed, infantsAllowed, welcomeMessage, instantBookingCategory, noticeHours, mininumAge, homeawayBookingPolicy, checkinTimeStart, checkinTimeEnd, checkoutTime, bookingPolicy

### `PATCH /rest/v1/content/products/{accommodation}/{productId}/reservation`
- **Descrizione:** Update reservation settings for a room/rate, without clear not given values
- **Parametri:** accommodation(path), productId(path)
- **Campi body (schema: `ExternalReservationConf`):** childrenAllowed, childrenQuantity, childrenMaxAge, childrenExtraPrice, noChildrenReason, smokersAllowed, petsAllowed, eventsAllowed, infantsAllowed, welcomeMessage, instantBookingCategory, noticeHours, mininumAge, homeawayBookingPolicy, checkinTimeStart, checkinTimeEnd, checkoutTime, bookingPolicy

### `GET /rest/v1/content/products/{accommodation}/{productId}/rooms`
- **Descrizione:** Retrieve all the rooms (subrooms with bed configuration) existing for the selected room/rate
- **Parametri:** accommodation(path), productId(path)

### `POST /rest/v1/content/products/{accommodation}/{productId}/rooms`
- **Descrizione:** Create a new room
- **Parametri:** accommodation(path), productId(path)
- **Campi body (schema: `ExternalRoomDescriptor`):** type, privateSpace, halfBathroom, location, roomNumber, subRoomConfigurations, maxGuests, bathtubPresent, showerPresent, description, defaultSubRoomBeds, defaultConfiguration

### `DELETE /rest/v1/content/products/{accommodation}/{productId}/fees/{index}`
- **Descrizione:** Delete the previously found fee
- **Parametri:** accommodation(path), productId(path), index(path)

### `DELETE /rest/v1/content/products/{accommodation}/{productId}/photos/{photoName}`
- **Descrizione:** Delete an already uploaded photo
- **Parametri:** accommodation(path), productId(path), photoName(path)

### `DELETE /rest/v1/content/products/{accommodation}/{productId}/rooms/{index}`
- **Descrizione:** Delete a previously found room
- **Parametri:** accommodation(path), productId(path), index(path)

### `GET /rest/v1/content/products/{accommodation}/process/{processId}`
- **Descrizione:** Check the status of one sent process
- **Parametri:** accommodation(path), processId(path)

### `GET /rest/v1/content/products/{accommodation}/{productId}/amenities`
- **Descrizione:** Retreive all the amenities of the listing. Deprecated, you can set them directly in inventory
- **Parametri:** accommodation(path), productId(path), portal(query)

### `POST /rest/v1/content/products/{accommodation}/{productId}/amenities`
- **Descrizione:** Add an amenity for all portals. Deprecated, you can add it directly in room inventory
- **Parametri:** accommodation(path), productId(path), amenity(query)

### `POST /rest/v1/content/products/{accommodation}/{productId}/pushQueue/{portalname}`
- **Descrizione:** Push the room/rate to the portal specified
- **Parametri:** accommodation(path), productId(path), portalname(path)

### `GET /rest/v1/content/products/{accommodation}/{productId}/photos/queue`
- **Descrizione:** Check the queue of photos
- **Parametri:** accommodation(path), productId(path), url(query), id(query)

### `GET /rest/v1/content/products/{accommodation}/{productId}/photos`
- **Descrizione:** Retrieve already uploaded photos
- **Parametri:** accommodation(path), productId(path)

### `POST /rest/v1/content/products/{accommodation}/{productId}/photos`
- **Descrizione:** Put on queue a new photo
- **Parametri:** accommodation(path), productId(path), url(query)

### `POST /rest/v1/content/products/{accommodation}/{productId}/{portalname}/calendar`
- **Descrizione:** Open close the calendar inside the external portal
- **Parametri:** accommodation(path), productId(path), portalname(path), status(query)

### `POST /rest/v1/content/products/{accommodation}/{productId}/cancellation`
- **Descrizione:** Set the cancellation policy for a specified PORTAL. To chose the right value, please refer to Metas 
- **Parametri:** accommodation(path), productId(path), value(query), portal(query)


## Chat  (20 endpoint)

### `PUT /rest/v1/chat/{property}/threads/members/{personId}`
- **Descrizione:** Add the given person to all threads of the accommodation network (according to user permissions)
- **Parametri:** property(path), personId(path)

### `DELETE /rest/v1/chat/{property}/threads/members/{personId}`
- **Descrizione:** Remove the given person from all threads of the accommodation network
- **Parametri:** property(path), personId(path)

### `PATCH /rest/v1/chat/{property}/threads/{thread}/archive`
- **Descrizione:** Archive the thread
- **Parametri:** property(path), thread(path)

### `GET /rest/v1/chat/{property}/messages`
- **Descrizione:** Search inside all chat messages for the queryString param. The search is performed on REFER (portal 
- **Parametri:** property(path), queryString(query)

### `POST /rest/v1/chat/{property}/messages`
- **Descrizione:** Create a new chat message
- **Parametri:** property(path)
- **Campi body (schema: `ChatMessageDTO`):** id, sender, threadId, externalThreadId, createTime, sentTime, status, processor, externalId, attributes, readers, attachment, specialOffer, review, currentAccommodations, externalSender, readTime

### `POST /rest/v1/chat/{property}/threads/{threadId}/preApprove`
- **Descrizione:** Create a new special offer
- **Parametri:** property(path), threadId(path)

### `POST /rest/v1/chat/{property}/threads/{threadId}/specialOffer`
- **Descrizione:** Create a new special offer
- **Parametri:** property(path), threadId(path)

### `GET /rest/v1/chat/{property}/threads/{id}`
- **Descrizione:** Retrieve chat thread
- **Parametri:** property(path), id(path)

### `GET /rest/v1/chat/{property}/threads/{thread}/messages`
- **Descrizione:** Retrieve all recent chat messages of the specified thread
- **Parametri:** property(path), thread(path), createdAfter(query), fields(query)

### `GET /rest/v1/chat/{property}/threads/{thread}/templates`
- **Descrizione:** Retrieve all chat messages of the specified thread
- **Parametri:** property(path), thread(path)

### `GET /rest/v1/chat/{property}/threads`
- **Descrizione:** Retrieve chat threads
- **Parametri:** property(path), offset(query), filterReadStatus(query)

### `GET /rest/v1/chat/{property}/unreadedMessagesCount`
- **Descrizione:** Count unreaded messages in the last 30 days of all threads of the user
- **Parametri:** property(path)

### `PATCH /rest/v1/chat/{property}/messages/readAll`
- **Descrizione:** Add the user in the list of readers of all messages
- **Parametri:** property(path)

### `PATCH /rest/v1/chat/{propertyId}/threads/{threadId}/read`
- **Descrizione:** Add the user in the list of readers of all the messages of the thread
- **Parametri:** propertyId(path), threadId(path)

### `PATCH /rest/v1/chat/{accommodationId}/threads/{thread}/aiAssistant`
- **Descrizione:** Enable AI Assistant for the thread
- **Parametri:** accommodationId(path), thread(path), enabled(query)

### `PATCH /rest/v1/chat/{property}/threads/{thread}/processor`
- **Descrizione:** Update the default processor of this thread
- **Parametri:** property(path), thread(path)

### `PATCH /rest/v1/chat/{accommodationId}/threads/{thread}/setAsUnread`
- **Descrizione:** Sets a chat thread as unread
- **Parametri:** accommodationId(path), thread(path)

### `PATCH /rest/v1/chat/{property}/threads/{threadId}/messages/{messageId}/translate/{language}`
- **Descrizione:** Translate the message to the requested language
- **Parametri:** property(path), threadId(path), messageId(path), language(path)

### `PUT /rest/v1/chat/{property}/messages/{messageId}`
- **Descrizione:** Update the message status
- **Parametri:** property(path), messageId(path)

### `PATCH /rest/v1/chat/{property}/threads/{threadId}/specialOffer/{specialOfferId}/withdraw`
- **Descrizione:** Withdraw the special offer
- **Parametri:** property(path), threadId(path), specialOfferId(path)


## Utilities: Enums, Metas, Fields  (5 endpoint)

### `GET /rest/v1/meta/contentPageFields`
- **Descrizione:** Retrieve content page meta

### `GET /rest/v1/meta/portals`
- **Descrizione:** Retrieve available portals

### `GET /rest/v1/meta/documents`
- **Descrizione:** Retrieve all kind of available documents

### `GET /rest/v1/meta/octorateAmenities`
- **Descrizione:** Retrieve Octorate Amenities. This is a subset of the ones the portals supports but we have chosen to
- **Parametri:** id(query), name(query)

### `GET /rest/v1/meta/content`
- **Parametri:** name(query), portal(query), category(query)


## Portals (OTA)  (2 endpoint)

### `PUT /rest/v1/portal/apiportal`
- **Descrizione:** Update the API portal
- **Campi body (schema: `ApiPortalRequestDTO`):** internalName, externalName, calendarValues, colorHex, logo, icon, banner, loginUrl, requiresHotelId, requiresPassword, requiresTokenAuthentication, website, contentMetas

### `POST /rest/v1/portal/apiportal`
- **Descrizione:** Create the API portal
- **Campi body (schema: `ApiPortalRequestDTO`):** internalName, externalName, calendarValues, colorHex, logo, icon, banner, loginUrl, requiresHotelId, requiresPassword, requiresTokenAuthentication, website, contentMetas


## User information  (1 endpoint)

### `GET /rest/v1/user/info`
- **Descrizione:** Retrieve information about an user


## Api configuration  (2 endpoint)

### `GET /rest/v1/api/configuration`
- **Descrizione:** Read Configuration

### `PATCH /rest/v1/api/configuration`
- **Descrizione:** Write Configuration
- **Campi body (schema: `ApiConfigurationRequest`):** environment, redirectUri, category, icon, secretVisibility, applicationName, description


## ARI: PMS Rooms  (2 endpoint)

### `GET /rest/v1/pms`
- **Descrizione:** Retrieve all the existing pms rooms for a user accommodation and its network

### `GET /rest/v1/pms/{accommodation}`
- **Descrizione:** Retrieve all the existing pms rooms
- **Parametri:** accommodation(path), name(query), id(query), includeRoomsWithoutParent(query)


## Property: Accommodations  (22 endpoint)

### `GET /rest/v1/accommodation/network/{network}`
- **Descrizione:** Retrieve a collection of properties that belongs to the same group
- **Parametri:** network(path), fields(query)

### `POST /rest/v1/accommodation/network/{network}`
- **Descrizione:** Add the accommodation provided to an existing network
- **Parametri:** network(path), accommodation(query)

### `GET /rest/v1/accommodation/network`
- **Descrizione:** Get all the accommodations that belongs to the same network of the provided accommodation
- **Parametri:** accommodationId(query), excludeCurrent(query), fields(query)

### `POST /rest/v1/accommodation/network`
- **Descrizione:** Create a new network of accommodations
- **Parametri:** accommodation(query)

### `GET /rest/v1/accommodation/{accommodation}`
- **Parametri:** accommodation(path), fields(query)

### `DELETE /rest/v1/accommodation/{accommodation}`
- **Descrizione:** Delete the specified property
- **Parametri:** accommodation(path)

### `DELETE /rest/v1/accommodation/{accommodation}/account`
- **Descrizione:** Deactivate the specified property account without permanently deleting it
- **Parametri:** accommodation(path)

### `DELETE /rest/v1/accommodation/{accommodation}/photos/{name}`
- **Descrizione:** Delete a photo of the property
- **Parametri:** accommodation(path), name(path)

### `GET /rest/v1/accommodation/{accommodationId}/icsLink`
- **Descrizione:** Retrieve the ICS Calendar link for the provided accommodation
- **Parametri:** accommodationId(path)

### `GET /rest/v1/accommodation/{accommodation}/photos`
- **Descrizione:** Retrieve photos
- **Parametri:** accommodation(path)

### `POST /rest/v1/accommodation/{accommodation}/photos`
- **Descrizione:** Push a PHOTO to the property
- **Parametri:** accommodation(path), url(query)
- **Campi body:** url

### `GET /rest/v1/accommodation/recentMessages`
- **Descrizione:** Recent messages
- **Parametri:** property(query)

### `GET /rest/v1/accommodation/{accommodation}/queue`
- **Descrizione:** Check the photo upload queue
- **Parametri:** accommodation(path)

### `GET /rest/v1/accommodation`
- **Descrizione:** Find accommodations created or attached. Response will vary according to the security provided (All 
- **Parametri:** page(query), name(query), mail(query)

### `GET /rest/v1/accommodation/{accommodation}/masterBilling`
- **Parametri:** accommodation(path), fields(query)

### `GET /rest/v1/accommodation/{accommodation}/queue/{id}`
- **Descrizione:** Check on the queue the status of the task provided
- **Parametri:** accommodation(path), id(path)

### `PATCH /rest/v2/accommodation/{accommodation}/changeAdminUserAccess`
- **Descrizione:** Authorize or revoke administrators access to the accommodation users
- **Parametri:** accommodation(path), value(query)

### `PATCH /rest/v2/accommodation/{accommodation}/changeGoodMorningEmail`
- **Descrizione:** Activate or deactivate good morning email
- **Parametri:** accommodation(path), value(query)

### `PATCH /rest/v2/accommodation/{accommodation}/changeRatePlanCross`
- **Descrizione:** Activate or deactivate rate plan cross
- **Parametri:** accommodation(path), value(query)

### `POST /rest/v2/accommodation`
- **Campi body (schema: `ApiAccommodationDTO`):** id, name, currency, timeZone, timeZoneOffset, phoneNumber, address, latitude, longitude, zipCode, city, checkinStart, checkinEnd, checkout, networkInfo, contact, propertyCategory, location, networkActive, license, logo, icon, coverImage, country, masterCalendar, clpms, insertTime, policeAccount, cleaningCost, breakfastIncluded, breakfastPrice, autoClose, zip, district, website, givenName, familyName, companyType, email, welcome_user, welcome_alternative_email, network_name, phone, accept_duplicates, cod_promo, vatCode, fiscalCode, taxIncluded, taxes, layout, lastCashClosingDay, customerHead, invoiceOptions, sandboxProperty, datePattern, language, licenseCode, credit, billingNetworkMasterAccount, billingNetworkName, additionalInformation, rating, preferThisLanguage, totalBeds, adminUserAccessGranted, mailTemplate

### `GET /rest/v2/accommodation/{accommodation}/mappedRooms`
- **Descrizione:** Return true if the accommodation has mapped rooms
- **Parametri:** accommodation(path)

### `PATCH /rest/v2/accommodation/{accommodation}`
- **Descrizione:** Update an existing accommodation
- **Parametri:** accommodation(path)
- **Campi body (schema: `ApiAccommodationDTO`):** id, name, currency, timeZone, timeZoneOffset, phoneNumber, address, latitude, longitude, zipCode, city, checkinStart, checkinEnd, checkout, networkInfo, contact, propertyCategory, location, networkActive, license, logo, icon, coverImage, country, masterCalendar, clpms, insertTime, policeAccount, cleaningCost, breakfastIncluded, breakfastPrice, autoClose, zip, district, website, givenName, familyName, companyType, email, welcome_user, welcome_alternative_email, network_name, phone, accept_duplicates, cod_promo, vatCode, fiscalCode, taxIncluded, taxes, layout, lastCashClosingDay, customerHead, invoiceOptions, sandboxProperty, datePattern, language, licenseCode, credit, billingNetworkMasterAccount, billingNetworkName, additionalInformation, rating, preferThisLanguage, totalBeds, adminUserAccessGranted, mailTemplate
