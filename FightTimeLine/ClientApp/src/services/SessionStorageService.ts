import { Injectable } from "@angular/core";
import { IStorage } from "../core/Models";

@Injectable()
export class SessionStorageService implements IStorage {
  setString(key: string, value: string): void {
    if (sessionStorage) {
      try {
        sessionStorage.removeItem(key);
        sessionStorage.setItem(key, value);
      }
      catch (err) {

      }
    }
  }

  getString(key: string): string {
    if (sessionStorage) {
      try {
        return sessionStorage.getItem(key);
      }
      catch (err) {

      }
    }
    return null;
  }

  setObject(key: string, value: object): void {
    if (sessionStorage) {
      try {
        sessionStorage.removeItem(key);
        sessionStorage.setItem(key, JSON.stringify(value));
      }
      catch (err) {

      }
    }
  }

  getObject<T>(key: string): T {
    if (sessionStorage) {
      try {
        const item = sessionStorage.getItem(key);
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
    if (sessionStorage) {
      try {
        return sessionStorage.clear();
      }
      catch (err) {

      }
    }
  }

  removeItem(key: string): void {
    if (sessionStorage) {
      try {
        sessionStorage.removeItem(key);
      }
      catch (err) {

      }
    }
  }
}
