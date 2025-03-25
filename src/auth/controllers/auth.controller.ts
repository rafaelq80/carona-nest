import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common"
import { LocalAuthGuard } from "../guard/local-auth.guard"
import { AuthService } from "../services/auth.service"
import { UsuarioLogin } from "./../entities/usuariologin.entity"
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger"

@Controller("/usuarios")
@ApiTags("Usuario")
@ApiBearerAuth()
export class AuthController {
	constructor(private authService: AuthService) {}

	@UseGuards(LocalAuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post("/logar")
	async login(@Body() user: UsuarioLogin): Promise<UsuarioLogin> {
		return this.authService.login(user)
	}
}
