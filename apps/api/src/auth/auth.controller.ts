import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";

@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post("login")
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post("register")
  register(
    @Body()
    body: {
      name: string;
      email: string;
      password: string;
      role: "RETAILER" | "DISPATCHER" | "RIDER";
      storeId?: string;
    },
  ) {
    return this.usersService.create(body);
  }
}
