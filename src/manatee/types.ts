export type DOMEntry = DOMEntryJava | DOMEntryWeb;

export type DOMEntryJava = {
  type: string;
  simpleType: string;
  shellType: string;
  interfaces: string;
  supers: string;
  bounds: string;
  showing: boolean;
  enabled: boolean;
  name: string;
  accessibleName: string;
  tooltip: string;
  text?: string;
  editable?: boolean;
  label?: string;
  children: DOMEntryJava[];
  matchThis: string;
  rows?: ({ rowIndex: string; rowCount: string; selected: boolean } & {
    [name: string]: string;
  })[];
  columns?: { header: string; value: string; index: number }[];
  tabs?: { [name: string]: DOMEntry };
  parent?: DOMEntryJava; // added by us
};

export type DOMEntryWeb = {
  _id: string;
  _tabindex: string;
  _class: string;
  _style: string;
  _title: string;
  "_aria-label": string;
  type: string;
  visible: boolean;
  children: DOMEntryWeb[];
  parent?: DOMEntryWeb; // added by us
};
