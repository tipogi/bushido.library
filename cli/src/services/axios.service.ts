import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { ClientRequest, IncomingMessage } from 'http';

interface IAxiosCustomReq {
  res: IncomingMessage;
}

@Injectable()
export class AxiosService {
  constructor(private readonly httpService: HttpService) {}
  async getReq(url: string): Promise<any> {
    try {
      return await firstValueFrom(this.httpService.get(url).pipe(map((response) => response.data)));
    } catch (e) {
      console.log(e)
      if (e instanceof AxiosError) {
        const { code, request } = e;
        console.log(request.res.statusCode);
      }
    }
  }
}
