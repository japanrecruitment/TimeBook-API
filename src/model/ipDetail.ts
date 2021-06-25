interface IpDetail {
    id: string;
    ip: string;
    detail: any;
}

type IpDetailDocument = IpDetail & Document;
