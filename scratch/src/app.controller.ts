import { Controller, Get } from '@nestjs/common';

@Controller('/app')
export class AppController {
    @Get('/asdf')
    getRootRoute() {
        return 'Hi theere!';
    }
}