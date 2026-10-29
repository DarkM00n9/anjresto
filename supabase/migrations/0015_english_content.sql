-- Contenus en anglais (traduits automatiquement à l'enregistrement, avec repli sur le français).
alter table restaurants
  add column tagline_en text,
  add column description_en text;

alter table categories
  add column name_en text,
  add column description_en text;

alter table menu_items
  add column name_en text,
  add column description_en text;

alter table daily_menus
  add column title_en text,
  add column starter_en text,
  add column main_en text,
  add column dessert_en text;
