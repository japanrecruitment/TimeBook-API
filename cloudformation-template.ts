import { AWS } from "@serverless/typescript";

const config = {
    vpc: {
        cidr: "10.0.0.0/16",
    },
    subnet1: {
        az: "ap-northeast-1a",
        cidr: "10.0.1.0/24",
    },
    subnet2: {
        az: "ap-northeast-1c",
        cidr: "10.0.2.0/24",
    },
    subnet3: {
        az: "ap-northeast-1d",
        cidr: "10.0.3.0/24",
    },
    subnet4: {
        az: "ap-northeast-1a",
        cidr: "10.0.4.0/24",
    },
};

const vpc: AWS["resources"]["Resources"] = {
    VPC: {
        Type: "AWS::EC2::VPC",
        Properties: {
            CidrBlock: config.vpc.cidr,
            EnableDnsSupport: true,
            EnableDnsHostnames: true,
            Tags: [{ Key: "Name", Value: "${self:service} VPC" }],
        },
    },
    PrivateSubnet1: {
        Type: "AWS::EC2::Subnet",
        Properties: {
            AvailabilityZone: config.subnet1.az,
            CidrBlock: config.subnet1.cidr,
            VpcId: { Ref: "VPC" },
            Tags: [{ Key: "Name", Value: "${self:service} Private Subnet 1" }],
        },
    },
    PrivateSubnet2: {
        Type: "AWS::EC2::Subnet",
        Properties: {
            AvailabilityZone: config.subnet2.az,
            CidrBlock: config.subnet2.cidr,
            VpcId: { Ref: "VPC" },
            Tags: [{ Key: "Name", Value: "${self:service} Private Subnet 2" }],
        },
    },
    PrivateSubnet3: {
        Type: "AWS::EC2::Subnet",
        Properties: {
            AvailabilityZone: config.subnet3.az,
            CidrBlock: config.subnet3.cidr,
            VpcId: { Ref: "VPC" },
            Tags: [{ Key: "Name", Value: "${self:service} Private Subnet 3" }],
        },
    },
    PublicSubnet1: {
        Type: "AWS::EC2::Subnet",
        Properties: {
            AvailabilityZone: config.subnet4.az,
            CidrBlock: config.subnet4.cidr,
            VpcId: { Ref: "VPC" },
            Tags: [{ Key: "Name", Value: "${self:service} Public Subnet 1" }],
        },
    },
};

const networking: AWS["resources"]["Resources"] = {
    Eip: {
        Type: "AWS::EC2::EIP",
        Properties: {
            Domain: "vpc",
            Tags: [{ Key: "Name", Value: "${self:service} EIP" }],
        },
    },
    NatGateway: {
        Type: "AWS::EC2::NatGateway",
        Properties: {
            AllocationId: {
                "Fn::GetAtt": ["Eip", "AllocationId"],
            },
            SubnetId: {
                Ref: "PublicSubnet1",
            },
            Tags: [{ Key: "Name", Value: "${self:service} Nat Gateway" }],
        },
    },
    // Route table (Private)
    PrivateRouteTable: {
        Type: "AWS::EC2::RouteTable",
        Properties: {
            VpcId: { Ref: "VPC" },
        },
    },
    // Routes (Private)
    PrivateRoute: {
        Type: "AWS::EC2::Route",
        Properties: {
            RouteTableId: { Ref: "PrivateRouteTable" },
            DestinationCidrBlock: "0.0.0.0/0",
            NatGatewayId: { Ref: "NatGateway" },
        },
    },
    // Subnet to Route Table associations
    SubnetRouteTableAssociationPrivate1: {
        Type: "AWS::EC2::SubnetRouteTableAssociation",
        Properties: {
            SubnetId: { Ref: "PrivateSubnet1" },
            RouteTableId: { Ref: "PrivateRouteTable" },
        },
    },
    SubnetRouteTableAssociationPrivate2: {
        Type: "AWS::EC2::SubnetRouteTableAssociation",
        Properties: {
            SubnetId: { Ref: "PrivateSubnet2" },
            RouteTableId: { Ref: "PrivateRouteTable" },
        },
    },
    SubnetRouteTableAssociationPrivate3: {
        Type: "AWS::EC2::SubnetRouteTableAssociation",
        Properties: {
            SubnetId: { Ref: "PrivateSubnet3" },
            RouteTableId: { Ref: "PrivateRouteTable" },
        },
    },
    // Internet Gateway
    InternetGateway: {
        Type: "AWS::EC2::InternetGateway",
        Properties: {
            Tags: [
                {
                    Key: "Name",
                    Value: "${self:service} Internet Gateway",
                },
            ],
        },
    },
    VPCGatewayAttachment: {
        Type: "AWS::EC2::VPCGatewayAttachment",
        Properties: {
            VpcId: { Ref: "VPC" },
            InternetGatewayId: { Ref: "InternetGateway" },
        },
    },
    // Route Table (public)
    PublicRouteTable: {
        Type: "AWS::EC2::RouteTable",
        Properties: {
            VpcId: { Ref: "VPC" },
            Tags: [
                {
                    Key: "Name",
                    Value: "${self:service} Public Route Table",
                },
            ],
        },
    },
    PublicRoute: {
        Type: "AWS::EC2::Route",
        Properties: {
            RouteTableId: { Ref: "PublicRouteTable" },
            DestinationCidrBlock: "0.0.0.0/0",
            GatewayId: { Ref: "InternetGateway" },
        },
    },
    SubnetRouteTableAssociationPublic1: {
        Type: "AWS::EC2::SubnetRouteTableAssociation",
        Properties: {
            SubnetId: { Ref: "PublicSubnet1" },
            RouteTableId: { Ref: "PublicRouteTable" },
        },
    },
};

const securityGroup: AWS["resources"]["Resources"] = {
    LambdaSecurityGroup: {
        Type: "AWS::EC2::SecurityGroup",
        Properties: {
            GroupName: "${self:service}-security-group",
            GroupDescription: "Allow all outbound traffic, no inbound",
            SecurityGroupIngress: [{ IpProtocol: -1, CidrIp: "127.0.0.1/32" }],
            VpcId: { Ref: "VPC" },
            Tags: [
                {
                    Key: "Name",
                    Value: "${self:service} Security Group",
                },
            ],
        },
    },
};

const elasticCache: AWS["resources"]["Resources"] = {
    ElastiCacheSecurityGroup: {
        Type: "AWS::EC2::SecurityGroup",
        Properties: {
            GroupName: "${self:service}-elasticache-security-group",
            GroupDescription: "Allow traffic for elasticache Redis Cluster",
            VpcId: { Ref: "VPC" },
            SecurityGroupIngress: [
                {
                    IpProtocol: "tcp",
                    FromPort: "6379",
                    ToPort: "6379",
                    SourceSecurityGroupId: { Ref: "LambdaSecurityGroup" },
                },
            ],
            Tags: [
                {
                    Key: "Name",
                    Value: "${self:service} ElastiCache Security Group",
                },
            ],
        },
    },
    ElastiCacheSubnetGroup: {
        Type: "AWS::ElastiCache::SubnetGroup",
        Properties: {
            Description: "${self:service} Elasticache Subnet Group",
            SubnetIds: [{ Ref: "PrivateSubnet1" }, { Ref: "PrivateSubnet2" }],
        },
    },
    ElastiCacheCluster: {
        DependsOn: ["ElastiCacheSecurityGroup"],
        Type: "AWS::ElastiCache::CacheCluster",
        Properties: {
            AutoMinorVersionUpgrade: true,
            Engine: "redis",
            CacheNodeType: "cache.t2.micro",
            NumCacheNodes: 1,
            VpcSecurityGroupIds: [{ "Fn::GetAtt": "ElastiCacheSecurityGroup.GroupId" }],
            CacheSubnetGroupName: { Ref: "ElastiCacheSubnetGroup" },
            Tags: [{ Key: "Name", Value: "${self:service} Elasticache Cluster" }],
        },
    },
};

const emailQueue: AWS["resources"]["Resources"] = {
    EmailQueue: {
        Type: "AWS::SQS::Queue",
        Properties: {
            QueueName: "${self:service}-${sls:stage}-queue",
            Tags: [
                {
                    Key: "Name",
                    Value: "${self:service}-${sls:stage} Email Queue",
                },
            ],
        },
    },
    EmailQueuePolicy: {
        Type: "AWS::SQS::QueuePolicy",
        Properties: {
            Queues: [{ Ref: "EmailQueue" }],
            PolicyDocument: {
                Statement: [
                    {
                        Action: ["SQS:SendMessage", "SQS:ReceiveMessage"],
                        Effect: "Allow",
                        Resource: { "Fn::GetAtt": "EmailQueue.Arn" },
                        Principal: {
                            AWS: ["${AWS::AccountId}"],
                        },
                    },
                ],
            },
        },
    },
};

const resources: AWS["resources"] = {
    Resources: {
        ...vpc,
        ...networking,
        ...securityGroup,
        ...elasticCache,
        ...emailQueue,
    },
};

export default resources;
