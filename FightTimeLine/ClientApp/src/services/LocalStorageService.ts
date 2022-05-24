import { Injectable } from "@angular/core";
import { IStorage } from "../core/Models";

@Injectable()
export class LocalStorageService implements IStorage {
  setString(key: string, value: string): void {
    if (localStorage) {
      try {
        localStorage.removeItem(key);
        localStorage.setItem(key, value);
      }
      catch (err) {

      }
    }
  }

  getString(key: string): string {
    if (localStorage) {
      try {
        return localStorage.getItem(key);
      }
      catch (err) {

      }
    }
    return null;
  }

  setObject(key: string, value: object): void {
    if (localStorage) {
      try {
        localStorage.removeItem(key);
        localStorage.setItem(key, JSON.stringify(value));
      }
      catch (err) {

      }
    }
  }

  getObject<T>(key: string): T {
    if (localStorage) {
      try {
        const item = localStorage.getItem(key);
        if (item) {
          return JSON.parse(item) as T;
        }
      }
      catch (err) {

      }
    }
    return null as T;
  }

  clear(): void {
    if (localStorage) {
      try {
        return localStorage.clear();
      }
      catch (err) {

      }
    }
  }

  removeItem(key: string): void {
    if (localStorage) {
      try {
        localStorage.removeItem(key);
      }
      catch (err) {

      }
    }
  }
}
