import { BodyParams, Controller, Post } from "@tsed/common";
import { ContentType } from "@tsed/schema";
import axios from "axios";

@Controller("/compiler")
export class Compiler {
  @Post()
  @ContentType("json")
  async compile(@BodyParams() params?: any) {
    return (await axios.post(
      "https://api.jdoodle.com/v1/execute",
      {
        ...params,
        clientId: "a6911fa32ba6d62569966af138da374f",
        clientSecret: "830201c9bae0a69ece5a3bc406992fa60df3855c0cb6672be052ff9cdda3f0f1",
      }
    )).data;
  }
}
