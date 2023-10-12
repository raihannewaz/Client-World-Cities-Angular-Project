import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { CityService } from '../services/city.service';
import { CountryService } from '../services/country.service';
import { City } from '../models/city';
import { Country } from '../models/country';

@Component({
  selector: 'app-city-list',
  templateUrl: './city-list.component.html',
  styleUrls: ['./city-list.component.css']
})
export class CityListComponent implements OnInit {
  cities: City[] = [];
  countries: Country[] = [];
  newCity: City = new City(0, '', 0, 0, 0, new Country(0, '', '', '', 0));
  newCountry: Country = new Country(0, '', '', '', 0);
  cityForm!: FormGroup;
  cityControls: FormGroup[] = [];
  
  

  constructor(
    private formBuilder: FormBuilder,
    private cityService: CityService,
    private countryService: CountryService
  ) {}

  ngOnInit() {
    this.createCityForm();
    this.loadCities();
    this.loadCountries();
    //this.addCity();
  }

  createCityForm() {
    this.cityForm = this.formBuilder.group({
      countryId: 0,
      name: '',
      iso2: '',
      iso3: '',
      cities: this.formBuilder.array([])
    });
  }
  

  loadCities() {
    this.cityService.getCities().subscribe({
      next: response => {
        console.log(response);
        this.cities = response.data;
      },
      error: error => {
        console.error('Error loading cities:', error);
      }
    });
  }

  loadCountries() {
    this.countryService.getCountries().subscribe({
      next: response => {
        console.log(response);
        this.countries = response.data;
      },
      error: error => {
        console.error('Error loading countries:', error);
      }
    });
  }

  getCountryName(countryId: number): string {
    const country = this.countries.find(c => c.id === countryId);
    return country ? country.name : 'Unknown';
  }


  editCity(city: City) {
    this.newCity = { ...city };
    this.newCity.country = this.countries.find(c => c.id === this.newCity.countryId) as Country;
    this.addCityControl(city);
    this.cityForm.get('countryId')?.setValue(city.countryId);
  }
  

addCityControl(city: City) {
  const cities = this.cityForm.get('cities') as FormArray;
  cities.push(this.formBuilder.group({
    name: city.name,
    lat: city.lat,
    lon: city.lon
  }));
  this.cityControls = cities.controls as FormGroup[];
}


  deleteCity(city: City) {
    if (confirm('Are you sure you want to delete this city?')) {
      this.cityService.deleteCity(city.id).subscribe({
        next: () => {
          console.log('City deleted:', city);
          this.loadCities();
        },
        error: (error: any) => {
          console.error('Error deleting city:', error);
        }
      });
    }
  }

  addCity() {
    const cities = this.cityForm.get('cities') as FormArray;
    cities.push(this.formBuilder.group({
      name: '',
      lat: 0,
      lon: 0
    }));
    this.cityControls = cities.controls as FormGroup[];
  }

  removeCity(index: number) {
    const cities = this.cityForm.get('cities') as FormArray;
    cities.removeAt(index);
    this.cityControls.splice(index, 1);
  }

  saveCities() {
    if (this.cityForm) {
      const countryId = this.cityForm.get('countryId')?.value;
      
      if (countryId === 0) {
        this.createCountryAndCities();
      } else {
        if (this.newCity.id !== 0) {
          this.updateCity(); 
        } else {
          this.createCities(countryId); 
        }
      }
    }
    
  }
  
  createCountryAndCities() {
    const countryData = {
      name: this.cityForm.get('name')?.value,
      iso2: this.cityForm.get('iso2')?.value,
      iso3: this.cityForm.get('iso3')?.value,
    };
    this.countryService.postCountry(countryData).subscribe({
      next: (countryResponse: any) => {
        console.log('Country created:', countryResponse);
  
        this.newCity.countryId = countryResponse.id;
        this.newCity.country = countryResponse as Country;
  
  
        this.createCities(countryResponse.id);
        this.loadCities();
        this.loadCountries();
        window.location.reload
      },
      error: (countryError: any) => {
        console.error('Error creating country:', countryError);
      }
    });
  }
  
  createCities(countryId: number) {
    const citiesArray = this.cityForm.get('cities') as FormArray;
    const citiesData = citiesArray.getRawValue();
    citiesData.forEach(cityData => {
      cityData.countryId = countryId;
      this.cityService.postCity(cityData).subscribe({
        next: (response: any) => {
          console.log('City created:', response);
          this.loadCities();
        },
        error: (error: any) => {
          console.error('Error creating city:', error);
        }
      });
    });
  
    this.cityForm.reset();
    this.cityControls = [];
  }

  private updateCity() {
    this.cityService.updateCity(this.newCity.id, this.newCity).subscribe({
      next: (response: any) => {
        console.log('City updated:', response);
        this.newCity = new City(0, '', 0, 0, 0, new Country(0, '', '', '', 0));
        window.location.reload();
      },
      error: (error: any) => {
        console.error('Error updating city:', error);
      }
    });
  }
  
}
