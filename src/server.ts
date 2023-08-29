import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { Client } from "pg";
import { getEnvVarOrFail } from "./support/envVarUtils";
import { setupDBClientConfig } from "./support/setupDBClientConfig";

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
        const boards = await client.query("select * from boards");
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
        const lists = await client.query(
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
        const cards = await client.query(
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
        const comments = await client.query(
            "select * from comments where card_id = $1",
            [id]
        );
        res.status(200).json(comments.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send("Something went wrong!");
    }
});

app.get("/health-check", async (_req, res) => {
    try {
        //For this to be successful, must connect to db
        await client.query("select now()");
        res.status(200).send("system ok");
    } catch (error) {
        //Recover from error rather than letting system halt
        console.error(error);
        res.status(500).send("An error occurred. Check server logs.");
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
