import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { Client } from "pg";
import { getEnvVarOrFail } from "./support/envVarUtils";
import { setupDBClientConfig } from "./support/setupDBClientConfig";
import queryAndLog from "./queryAndLog";

dotenv.config(); //Read .env file lines as though they were env vars.

const dbClientConfig = setupDBClientConfig();
const client = new Client(dbClientConfig);

//Configure express routes
const app = express();

app.use(express.json()); //add JSON body parser to each following route handler
app.use(cors()); //add CORS support to each following route handler

// get all boards
app.get("/boards", async (_req, res) => {
    try {
        const boards = await queryAndLog(client, "select * from boards");
        res.status(200).json(boards.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send("Something went wrong!");
    }
});
// get all lists
app.get("/lists/:board_id", async (req, res) => {
    try {
        const id = parseInt(req.params.board_id);
        const lists = await queryAndLog(
            client,
            "select * from lists where board_id = $1",
            [id]
        );
        res.status(200).json(lists.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send("Something went wrong!");
    }
});
// get all cards
app.get("/cards/:list_id", async (req, res) => {
    try {
        const id = parseInt(req.params.list_id);
        const cards = await queryAndLog(
            client,
            "select * from cards where list_id = $1",
            [id]
        );
        res.status(200).json(cards.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send("Something went wrong!");
    }
});
// get all comments for given card
app.get("/comments/:card_id", async (req, res) => {
    try {
        const id = parseInt(req.params.card_id);
        const comments = await queryAndLog(
            client,
            "select * from comments where card_id = $1",
            [id]
        );
        res.status(200).json(comments.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send("Something went wrong!");
    }
});

// post a board
app.post("/boards", async (req, res) => {
    const { name } = req.body;
    try {
        const board = await queryAndLog(
            client,
            "insert into boards (name) values ($1) returning *",
            [name]
        );
        res.status(200).json(board.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send("Something went wrong!");
    }
});

// post a list
app.post("/lists", async (req, res) => {
    const { board_id, name } = req.body;
    try {
        const list = await queryAndLog(
            client,
            "insert into lists (board_id, name) values ($1, $2) returning *",
            [board_id, name]
        );
        res.status(200).json(list.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send("Something went wrong!");
    }
});

// post a card
app.post("/cards", async (req, res) => {
    const { list_id, name } = req.body;
    try {
        const card = await queryAndLog(
            client,
            "insert into cards (list_id, name) values ($1, $2) returning *",
            [list_id, name]
        );
        res.status(200).json(card.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send("Something went wrong!");
    }
});

// post a comment
app.post("/comments", async (req, res) => {
    const { card_id, text } = req.body;
    try {
        const comment = await queryAndLog(
            client,
            "insert into comments (card_id, text) values ($1, $2) returning *",
            [card_id, text]
        );
        res.status(200).json(comment.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send("Something went wrong!");
    }
});

app.get("/health-check", async (_req, res) => {
    try {
        //For this to be successful, must connect to db
        await queryAndLog(client, "select now()");
        res.status(200).send("system ok");
    } catch (error) {
        //Recover from error rather than letting system halt
        console.error(error);
        res.status(500).send("An error occurred. Check server logs.");
    }
});

app.put("/cards/:card_id", async (req, res) => {
    const { name } = req.body;

    try {
        const id = parseInt(req.params.card_id);
        const cards = await queryAndLog(
            client,
            "update cards set name = $1 where card_id = $2 returning *",
            [name, id]
        );
        res.status(200).json(cards.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send("Something went wrong!");
    }
});

app.put("/comments/:comment_id", async (req, res) => {
    const { text } = req.body;

    try {
        const id = parseInt(req.params.comment_id);
        const cards = await queryAndLog(
            client,
            "update comments set text = $1 where comment_id = $2 returning *",
            [text, id]
        );
        res.status(200).json(cards.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send("Something went wrong!");
    }
});

app.delete("/cards/:card_id", async (req, res) => {
    try {
        const id = parseInt(req.params.card_id);
        await queryAndLog(client, "delete from comments where card_id = $1", [
            id,
        ]);
        const cards = await queryAndLog(
            client,
            "delete from cards where card_id = $1 returning *",
            [id]
        );
        res.status(200).json(cards.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send("Something went wrong!");
    }
});

app.delete("/comments/:comment_id", async (req, res) => {
    try {
        const id = parseInt(req.params.comment_id);
        const comment = await queryAndLog(
            client,
            "delete from comments where comment_id = $1 returning *",
            [id]
        );
        res.status(200).json(comment.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send("Something went wrong!");
    }
});
app.put("/boards/:board_id", async (req, res) => {
    const { colour } = req.body;

    try {
        const id = parseInt(req.params.board_id);
        const boards = await queryAndLog(
            client,
            "update boards set colour = $1 where board_id = $2 returning *",
            [colour, id]
        );
        res.status(200).json(boards.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send("Something went wrong!");
    }
});
connectToDBAndStartListening();

async function connectToDBAndStartListening() {
    console.log("Attempting to connect to db");
    await client.connect();
    console.log("Connected to db!");

    const port = getEnvVarOrFail("PORT");
    app.listen(port, () => {
        console.log(
            `Server started listening for HTTP requests on port ${port}.  Let's go!`
        );
    });
}
