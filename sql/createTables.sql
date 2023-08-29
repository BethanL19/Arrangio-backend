create table if not exists boards(
board_id serial primary key,
  name varchar(50)
);

insert into boards (name) values ('test board');
select * from boards;


create table if not exists lists(
list_id serial primary key,
  board_id int, FOREIGN KEY (board_id) REFERENCES boards(board_id),
  name varchar(50)
);
insert into lists (board_id, name) values (1, 'To-Do'),(1, 'Doing'),(1, 'Done');
select * from lists;


create table if not exists cards(
card_id serial primary key,
  list_id int, FOREIGN KEY (list_id) REFERENCES lists(list_id),
  name varchar(50)
);
insert into cards (list_id, name) values (1, 'Test'),(2, 'Test'),(3, 'Test');
select * from cards;

create table if not exists comments(
comment_id serial primary key,
  card_id int, FOREIGN KEY (card_id) REFERENCES cards(card_id),
  text varchar(550)
);
insert into comments (card_id, text) values (1, 'Test comment');
select * from comments;

