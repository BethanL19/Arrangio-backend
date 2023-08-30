import { performance } from "perf_hooks";
import { Client } from "pg";
import { QueryResult } from "pg";

let qNum = 0;

function applyLeftPadding(num: number): string {
    const n = String(num);
    let padded = "";
    if (n.length < 4) {
        for (let i = n.length; i < 4; i++) {
            padded += "0";
        }

        padded += n;

        return padded;
    } else {
        return n;
    }
}

async function queryAndLog(
    client: Client,
    sql: string,
    params: any[] = []
): Promise<QueryResult<any>> {
    qNum++;

    const startTime = performance.now();

    console.log(
        `SQL START qNum: ${applyLeftPadding(
            qNum
        )}  sql: ${sql} params: ${params}`
    );

    const response = await client.query(sql, params);

    const stopTime = performance.now();
    const time = stopTime - startTime;

    console.log(
        `SQL END   qNum: ${applyLeftPadding(qNum)}  time:     ${time.toFixed(
            3
        )}ms rowCount:     ${response.rowCount} sql:  ${sql} params:  ${params}`
    );

    return response;
}

export default queryAndLog;
