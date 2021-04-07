import { ExportTemplate } from "../BaseExportTemplate"
import { ExportData, IExportResultSet, IExportRow } from "../ExportModels";
import { PresenterManager } from "../PresentationManager";
import { Utils } from "../Utils";

export class DescriptiveTemplate extends ExportTemplate {
  constructor() {
    super();
  }

  get name(): string {
    return "Descriptive";
  }

  build(data: ExportData, presenter: PresenterManager): IExportResultSet {

    const rows = data.data.boss.attacks
      .sort((a, b) => this.offsetCompareFn(a.offset, b.offset))
      .map(attack => <IExportRow>{
        cells: [
          this.text({
            text: attack.offset,
            align: "center",
            refId: (data.data.boss.downTimes.find(d => Utils.inRange(d.start, d.end, attack.offset)) || { id: null }).id,
            disableUnique: true,
            colorFn: (a) => {
              const dt = data.data.boss.downTimes.find(d => Utils.inRange(d.start, d.end, a.offset));
              return dt && dt.color || "";
            },
            bgRefIdFn: (a) => {
              const dt = data.data.boss.downTimes.find(d => Utils.inRange(d.start, d.end, attack.offset))
              return dt && dt.id;
            }
          }),
          this.text({
            text: attack.name,
            color: this.getColor(attack),
            refId: attack.id
          }),
          this.text({
            text: attack.desc
          }),
          this.items(attack.tags?.map(t => ({ text: t })) || [], {})

        ],
        filterData: attack
      });

    const columns = [
      {
        text: "Time",
        name: "time",
        width: "50px",
        align: "center",
        listOfFilter: data.data.boss.downTimes
          .map(d => ({ text: d.comment, value: d, byDefault: true }))
          .concat({ text: "Other", value: <any>{ comment: "Other" }, byDefault: true }),
        filterFn: (data, row, col) => {
          const found = col && col.listOfFilter && col.listOfFilter.find(item => item.value && Utils.inRange(item.value.start, item.value.end, row.filterData.offset))

          if (found)
            return data.some(item => item && item.comment === found.value.comment);

          return data.some(item => item && item.comment === "Other");
        },
      },
      {
        name: "boss",
        text: "Attack",
        width: "200px",
        listOfFilter: (presenter && presenter.tags || []).concat(["Other"]).map(t => ({ text: t, value: t, byDefault: true })),
        filterFn: (a, d) => {
          let visible = !a || a.some(value => ((!d.filterData.tags || d.filterData.tags.length === 0) && value === "Other") || d.filterData.tags && d.filterData.tags.includes(value));
          return visible;
        }
      },
      {
        name: "desc",
        text: "Description",
      },
      {
        name: "tags",
        text: "Tags",
      },
    ];


    return <IExportResultSet>{
      columns: columns,
      rows: rows,
      title: this.name,
      filterByFirstEntry: true
    };
  }
}

