import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class AxiosService {
  constructor(private readonly httpService: HttpService) {}
  async activeUrl(domain: string): Promise<string | number> {
    try {
      const res = await firstValueFrom<string | number>(
        this.httpService
          .post('http://localhost:4000/api/tor-proxy/ping-domain', { domain })
          .pipe(map((response) => response.data)),
      );
      return res;
    } catch (e) {
      return 0;
    }
  }
}
