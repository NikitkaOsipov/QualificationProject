# PasakumuKarte

PasakumuKarte ir sociāla tīkla platforma, kas palīdz lietotājiem atrast, publicēt un pārvaldīt pasākumus interaktīvā kartē. Projekts apvieno `Laravel` backend daļu, `Next.js` frontend lietotni, kā arī mobilās platformas sagatavi ar `Capacitor`.

## Apraksts

Šī projekta mērķis ir nodrošināt vienotu vidi pasākumu publicēšanai un atklāšanai:

- apskatīt pasākumus sarakstā vai kartē,
- filtrēt pasākumus pēc kategorijām, datumiem un sociāliem kritērijiem,
- izveidot jaunus pasākumus vairāku soļu vednī,
- pārvaldīt lietotāja profilu, draugus un sekotājus,
- saņemt paziņojumus par aktivitātēm sistēmā,
- administrēt lietotājus administratora panelī.

## Galvenās iespējas

- **Pasākumu pārlūkošana** saraksta skatā ar meklēšanu, kārtošanu un filtriem
- **Interaktīva karte** ar pasākumu marķieriem un ātru detalizētas informācijas apskati
- **Pasākumu izveide**
- **Intereses un dalības atzīmes** pasākumiem
- **Komentāri** un iesaiste pie pasākumiem
- **Lietotāju profili** ar sekotājiem, draugiem un aktivitāšu cilnēm
- **Paziņojumu sistēma** 
- **Autentifikācija** ar reģistrāciju, pieslēgšanos, paroles atjaunošanu un e-pasta verifikāciju
- **Administratora panelis** lietotāju pārvaldīšanai
- **Mobilā integrācija** caur `Capacitor` Android platformām

## Tehnoloģiji

### Frontend

- `Next.js 15`
- `React 18`
- `TypeScript`
- `Tailwind CSS`
- `Leaflet` un `react-leaflet`
- `Laravel Echo` + `pusher-js`
- `Capacitor`

### Backend

- `PHP 8.2`
- `Laravel 12`
- `PostgreSQL`

## Repozitorija struktūra

```text
QualificationProjectRepo/
├── backend/          # Laravel API
├── frontend/         # Next.js lietotne un Capacitor
├── docs/             # Darba dokumentācija
```

## Palaišana ar Docker serverī

Vienkāršākais veids, kā palaist projektu, ir izmantot `Docker Compose`.

### Nepieciešamā konfigurācija

- instalēts `Docker`
- instalēts `Docker Compose`
- servera videi nepieciešams `nginx` reverse proxy
- servera videi nepieciešams SSL sertifikāts (`ssl/cert.pem` un `ssl/key.pem`)
- aizpildīti nepieciešamie vides mainīgie


- serverim (Docker izvietošanai) tiek izmantots saknes `.env` fails
- `backend/.env.example` un `frontend/.env.example` ir paraugi localhost konfigurācijai


### Palaišanas soļi

```powershell
docker compose up --build
```

Pēc palaišanas infrastruktūra sastāv no šādiem servisiem:

- `postgres`
- `backend`
- `queue`
- `reverb`
- `frontend`
- `nginx`

## Lokālā izstrāde bez Docker

### Nepieciešamā konfigurācija

- aizpildīti backend/.env un frontend/.env faili ar nepieciešamajiem vides mainīgajiem

### Backend

```shell
cd backend
composer install
php artisan key:generate
php artisan migrate
php artisan storage:link
php artisan serve
```

### Frontend

```shell
cd frontend
npm install
npm run dev
```
