import { Injectable, Inject } from "@angular/core"
import { HttpClient, HttpHeaders } from "@angular/common/http"
import { Observable } from "rxjs"
import { IExportResultSet } from "src/core/ExportModels";

@Injectable()
export class SpreadSheetsService {
    constructor(
        private httpClient: HttpClient,
        @Inject("GOOGLE_API_SPREADSHEETS_URL") private basePath: string) { }

    create(token: string, data: IExportResultSet): Observable<any> {

        const request = {
            properties: {
                title: data.title,
                locale: "en"
            },
            sheets: [
                {
                    properties: {
                        sheetId: 0,
                        title: data.title,
                        index: 0,
                        sheetType: "GRID",
                        gridProperties: {
                            columnCount: data.columns.length,
                            frozenRowCount: 1
                        },
                        hidden: false,
                        rightToLeft: false
                    },
                    data: [
//                        {
//                            startRow: 0,
//                            startColumn: 0,
//                            rowData: [
//                                this.valuesCollectionOfStringsFromArray(data.columns.map(it=>it.text)),
//                                ...data.rows.map(it => this.valuesCollectionOfStringsFromArray(
//                                    it.map(
//                                        (it1: IExportResultItem[]) =>
//                                            it1.map((it2: IExportResultItem) => it2.text).join(", "))))]
//                        }
                    ],
                    rowGroups: [
                        {
                        }
                    ],
                    columnGroups: [
                        {
                        }
                    ]
                }
            ]
        };

        return this.httpClient.post<any[]>(this.basePath,
            request,
            {
                headers: new HttpHeaders({
                    Authorization: `Bearer ${token}`
                })
            });
    }

    valuesCollectionOfStringsFromArray(arr: string[]): any {
        return {
            values: arr.map(it => <any>{
                userEnteredValue: {
                    stringValue: it
                }
            })
        };
    }
}
