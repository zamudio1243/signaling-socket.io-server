import { BodyParams, Controller, Post } from "@tsed/common";
var request = require("request");
@Controller("/compiler")
export class Compiler {
  @Post("/compile")
  compile(@BodyParams() data: any) {
    return request(
      {
        url: "https://api.jdoodle.com/v1/execute",
        method: "POST",
        json: {
          ...data,
          clientId: "a6911fa32ba6d62569966af138da374f",
          clientSecret:
            "830201c9bae0a69ece5a3bc406992fa60df3855c0cb6672be052ff9cdda3f0f1",
        },
      },
      function (error: any, response: any, body: any) {
        console.log("error:", error);
        console.log("statusCode:", response && response.statusCode);
        console.log("body:", body);
        return body;
      }
    );
  }
}
