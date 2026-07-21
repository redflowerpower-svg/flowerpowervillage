# Octorate PMS API Service Integration — Fonte di Verità Assoluta

## Overview
Octorate è il Property Management System (PMS) channel manager per Flower Power Village (Koh Phayam). Gestisce le disponibilità in tempo reale, i piani tariffari dinamici e l'inserimento delle prenotazioni dal Booking Engine.

## Environment Variables
* `VITE_OCTORATE_CLIENT_ID`: Client ID pubblico per l'integrazione OAuth (`public_5b03d32645444204a1fcdbf7af2a978d`).
* `OCTORATE_SECRET_KEY`: Secret key privata dell'API (`secret_9f5edc3ed29f4e30abb9d8f801b6b555DDKOPIUXMA`).
* `VITE_OCTORATE_STRUCTURE_ID`: ID struttura hotel Octorate (`366879`).
* `VITE_OCTORATE_CHANNEL_ID`: ID canale prenotazioni dirette (`233`).
* `VITE_OCTORATE_REDIRECT_URI`: OAuth redirect target (`https://localhost/`).

---

## Tassonomia dei Piani Tariffari
- **7D / 14D:** Tariffe Standard (Booking, Agoda, Expedia, C-Trip) con cancellazione a 7 o 14 giorni.
- **Main bnb-7d / 14d:** Tariffe con Colazione inclusa (solo Booking/Expedia).
- **AC7d / 14d:** Tariffe con Aria Condizionata inclusa (solo Booking/Expedia).
- **AC bnb-7d / 14d:** Tariffe con AC + Colazione (solo Booking/Expedia).
- **AGD AC-7d / 14d:** Tariffe AC Esclusive per Agoda.
- **AirBnB / AirBnB AC:** Tariffe dedicate esclusive per Airbnb.
- **BE:** Tariffe esclusive per il nostro Website Booking Engine.

---

## Database Ufficiale ID Octorate (Master & Derivate)

### Ville e Lodge (4+ Ospiti)
- **Peace & Love Villa:** 7d: #495549 | Main bnb-7d: #495575 | 14d: #495551 | Main bnb-14d: #495580 | AC7d: #495552 | AC bnb-7d: #495587 | AC14d: #495565 | AC bnb-14d: #495593 | AGD AC-7d: #921874 | AGD AC-14d: #921875 | AirBnB: #495569 | AirBnB AC: #495609 | BE: #495566
- **Penthouse Villa:** 7d: #422445 | Main bnb-7d: #421520 | 14d: #421513 | Main bnb-14d: #421516 | AC7d: #421522 | AC bnb-7d: #421525 | AC14d: #421527 | AC bnb-14d: #421530 | AGD AC-7d: #921876 | AGD AC-14d: #921877 | AirBnB: #421532 | AirBnB AC: #421533 | BE: #449348
- **Jungle Villa (Standard):** 7d: #529778 | Main bnb-7d: #529788 | 14d: #529779 | Main bnb-14d: #529792 | AC7d: #529780 | AC bnb-7d: #916816 | AC14d: #529781 | AC bnb-14d: #529801 | AGD AC-7d: #921868 | AGD AC-14d: #921869 | AirBnB: #529783 | AirBnB AC: #529813 | BE: #529784
- **Jungle Villa Left:** 7d: #495803 | Main bnb-7d: #496001 | 14d: #495804 | Main bnb-14d: #496009 | AC7d: #495805 | AC bnb-7d: #496022 | AC14d: #495806 | AC bnb-14d: #496031 | AGD AC-7d: #921870 | AGD AC-14d: #921871 | AirBnB: #495810 | AirBnB AC: #496057 | BE: #495807
- **Jungle Villa Right:** 7d: #495976 | Main bnb-7d: #496002 | 14d: #495977 | Main bnb-14d: #496010 | AC7d: #495978 | AC bnb-7d: #496021 | AC14d: #495979 | AC bnb-14d: #496030 | AGD AC-7d: #921872 | AGD AC-14d: #921873 | AirBnB: #495982 | AirBnB AC: #496056 | BE: #495980
- **Lodge 1:** 7d: #422149 | Main bnb-7d: #332767 | 14d: #293952 | Main bnb-14d: #332769 | AC7d: #331974 | AC bnb-7d: #332129 | AC14d: #422157 | AC bnb-14d: #332142 | AGD AC-7d: #921884 | AGD AC-14d: #921885 | AirBnB: #297030 | AC AirBnB: #421510 | BE: #449736
- **Lodge 2:** 7d: #916110 | Main bnb-7d: #916109 | 14d: #916108 | Main bnb-14d: #916107 | AC7d: #916114 | AC bnb-7d: #916829 | AC14d: #916105 | AC bnb-14d: #916830 | AGD AC-7d: #921886 | AGD AC-14d: #921887 | AirBnB: #916103 | AC AirBnB: #916104 | BE: #923905

### Bungalow Colorati (2 Ospiti)
- **Red Bungalow:** 7d: #422131 | Main bnb-7d: #332029 | 14d: #293953 | Main bnb-14d: #332030 | AC7d: #330964 | AC bnb-7d: #332035 | AC14d: #330970 | AC bnb-14d: #332036 | AGD AC-7d: #921880 | AGD AC-14d: #921881 | AirBnB: #297021 | AirBnB AC: #340196 | BE: #449422
- **Green Bungalow:** 7d: #422402 | Main bnb-7d: #332066 | 14d: #293961 | Main bnb-14d: #332070 | AC7d: #331923 | AC bnb-7d: #332072 | AC14d: #331924 | AC bnb-14d: #332074 | AGD AC-7d: #921882 | AGD AC-14d: #921883 | AirBnB: #297023 | AirBnB AC: #340200 | BE: #449668
- **Yellow Bungalow:** 7d: #422422 | Main bnb-7d: #332054 | 14d: #293958 | Main bnb-14d: #332055 | AC7d: #331921 | AC bnb-7d: #332057 | AC14d: #331922 | AC bnb-14d: #332060 | AGD AC-7d: #921878 | AGD AC-14d: #921879 | AirBnB: #297022 | AirBnB AC: #340198 | BE: #449385

### Tende (2 Ospiti)
- **Lagoon Tent:** 7d: #422351 | Main bnb-7d: #332077 | 14d: #293956 | Main bnb-14d: #332081 | AirBnB: #297024 | BE: #449674
- **Camel Tent:** 7d: #422325 | Main bnb-7d: #332084 | 14d: #293966 | Main bnb-14d: #332089 | AirBnB: #297025 | BE: #449675

### Camere (2 Ospiti)
- **Room 1:** 7d: #422300 | Main bnb-7d: #332735 | 14d: #293964 | Main bnb-14d: #332737 | AC7d: #331976 | AC bnb-7d: #916818 | AC14d: #331977 | AC bnb-14d: #916402 | AGD AC-7d: #921889 | AGD AC-14d: #921890 | AirBnB: #297033 | AirBnB AC: #421505 | BE: #449678
- **Room 2:** 7d: #422296 | Main bnb-7d: #332739 | 14d: #293960 | Main bnb-14d: #332741 | AC7d: #331966 | AC bnb-7d: #332119 | AC14d: #331967 | AC bnb-14d: #332134 | AGD AC-7d: #921891 | AGD AC-14d: #921900 | AirBnB: #297032 | AirBnB AC: #421506 | BE: #449684
- **Room 3:** 7d: #422293 | Main bnb-7d: #332757 | 14d: #293947 | Main bnb-14d: #332743 | AC7d: #331968 | AC bnb-7d: #332121 | AC14d: #331969 | AC bnb-14d: #332136 | AGD AC-7d: #921892 | AGD AC-14d: #921893 | AirBnB: #297028 | AirBnB AC: #421507 | BE: #449699
- **Room 4:** 7d: #422265 | Main bnb-7d: #332746 | 14d: #293946 | Main bnb-14d: #332759 | AC7d: #331970 | AC bnb-7d: #332123 | AC14d: #331971 | AC bnb-14d: #332138 | AGD AC-7d: #921894 | AGD AC-14d: #921895 | AirBnB: #297029 | AirBnB AC: #421508 | BE: #449724
- **Room 5:** 7d: #422213 | Main bnb-7d: #332763 | 14d: #293944 | Main bnb-14d: #332765 | AC7d: #331972 | AC bnb-7d: #332125 | AC14d: #331973 | AC bnb-14d: #332140 | AGD AC-7d: #921896 | AGD AC-14d: #921897 | AirBnB: #297031 | AirBnB AC: #421509 | BE: #449730
- **Internal Room:** 7d: #872182 | Main bnb-7d: #332105 | 14d: #293941 | 14d 1 PAX: #916905 | Main bnb-14d: #332109 | AC7d: #340367 | AC bnb-7d: #916840 | AC14d (Centrico): #421998 | AC bnb-14d: #916838 | AGD AC-7d: #921898 | AGD AC-14d: #921899 | AirBnB: #297027 | AirBnB AC: #422147 | Internal BE: #449742

### Unità di Appoggio (Fittizie, solo per uso interno/Test)
- Fake Bungalow 1: #649669
- Fake Bungalow 2: #921799
