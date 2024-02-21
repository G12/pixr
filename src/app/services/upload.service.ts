import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  SERVER_URL = 'https://geopad.ca';
  constructor(private httpClient: HttpClient) { }

  // Returns an observable
  upload(file): Observable<any> {

    console.log('file.name: ' + file.name);
    console.log(file);
    // Create form data
    const formData = new FormData();

    // Store form name as "file" with file data
    formData.append('file', file, file.name);

    // Make http post request over api
    // with formData as req
    const uploadURL = `${this.SERVER_URL}/upToPixr2.php`;
    return this.httpClient.post(uploadURL, formData);
  }

  public uploadFile(data): Observable <any> {
    const uploadURL = `${this.SERVER_URL}/upToPixr2.php`;
    console.log('post following data to: ' + uploadURL);
    console.log(data);
    return this.httpClient.post<any>(uploadURL, data);
  }

}
