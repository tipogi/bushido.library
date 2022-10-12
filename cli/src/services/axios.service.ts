import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpService } from '@nestjs/axios';
import { HttpErrors } from 'src/constants/enumerators';

@Injectable()
export class AxiosService {
  constructor(private readonly httpService: HttpService) {}
  async activeUrl(url: string): Promise<boolean | string> {
    try {
      await firstValueFrom(this.httpService.get(url).pipe(map((response) => response.data)));
      return true;
    } catch (e) {
      const { code, request } = e;
      if (HttpErrors.ERR_BAD_REQUEST === code && request.res.statusCode) {
        return false;
      } else {
        return code;
      }
    }
  }
}
