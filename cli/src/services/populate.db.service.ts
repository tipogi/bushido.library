import { Injectable } from '@nestjs/common';

@Injectable()
export class PopulateDBService {
  async withTopics() {
    console.log('withTopics');
  }
  async withDomains() {
    console.log('withDomains');
  }
}
