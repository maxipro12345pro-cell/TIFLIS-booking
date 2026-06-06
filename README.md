# TIFLIS Branch Booking

Веб-приложение для бронирования столиков в двух филиалах грузинского ресторана TIFLIS в Кишинёве: «Центр» и «Рышкановка».

## Стек

- React + Vite + React Router
- Tailwind CSS
- Supabase PostgreSQL, Auth, Realtime
- Resend через Vercel serverless endpoint
- Vercel hosting

## Запуск

```bash
npm install
npm run dev
```

Скопируйте `.env.example` в `.env.local` и заполните:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
RESEND_API_KEY=
RESEND_FROM=
```

Без Supabase env приложение использует локальные seed-данные для первого экрана и демонстрации флоу.

## Supabase

Миграция находится в `supabase/migrations/202605310001_initial_schema.sql`.

Она создаёт:

- `branches`
- `tables`
- `reservations`
- `staff_branches`
- RLS policies
- seed для филиалов TIFLIS «Центр» и «Рышкановка»
- seed для разных карт залов каждого филиала

Все CRUD-запросы к бронированиям фильтруются по `branch_id`.

## Что уже собрано

- Глобальный `BranchContext`
- Публичный выбор филиала
- Многошаговое бронирование
- Универсальная карта зала с двумя конфигами
- Supabase CRUD + Realtime hook с фильтром по филиалу
- Hostess login и dashboard scaffold
- Vercel endpoint `/api/send-confirmation` для Resend
