import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { City } from '../models/city';

@Injectable({
  providedIn: 'root'
})
export class CityService {
  private url = 'https://localhost:40443/api/Cities';

  constructor(private http: HttpClient) { }

  getCities(): Observable<any> {
    return this.http.get<any>(this.url);
  }

  getCity(id: any): Observable<any> {
    return this.http.get<any>(`${this.url}/${id}`);
  }

  postCity(city: City):  Observable<any> {
    return this.http.post<any>(this.url,city);
  }

  updateCity(id:any,citydata: City): Observable<any> {

    return this.http.put<any>(`${this.url}/${id}`,citydata);
  }

  deleteCity(id: any): Observable<any> {
    return this.http.delete<any>(`${this.url}/${id}`);
  }

}

