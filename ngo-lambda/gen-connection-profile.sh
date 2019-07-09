#!/bin/bash

# Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
# 
# Licensed under the Apache License, Version 2.0 (the "License").
# You may not use this file except in compliance with the License.
# A copy of the License is located at
# 
#     http://www.apache.org/licenses/LICENSE-2.0
# 
# or in the "license" file accompanying this file. This file is distributed 
# on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either 
# express or implied. See the License for the specific language governing 
# permissions and limitations under the License.

# REPODIR points to this repo
# LOCALCA points to the location of the TLS cert
REPODIR=~/non-profit-blockchain
LAMBDAREPODIR=$REPODIR/ngo-lambda
LOCALCA=./certs/managedblockchain-tls-chain.pem
CONNECTION_PROFILE_YAML=$LAMBDAREPODIR/config/ngo-connection-profile.yaml

#copy the connection profiles
cp $REPODIR/ngo-rest-api/connection-profile/ngo-connection-profile-template.yaml $CONNECTION_PROFILE_YAML
cp $REPODIR/ngo-rest-api/connection-profile/client-org1.yaml $LAMBDAREPODIR/config/client-org.yaml

#update the connection profiles with endpoints and other information
sed -i "s|%PEERNODEID%|$PEERNODEID|g" $CONNECTION_PROFILE_YAML
sed -i "s|%MEMBERID%|$MEMBERID|g" $CONNECTION_PROFILE_YAML
sed -i "s|%CAFILE%|$LOCALCA|g" $CONNECTION_PROFILE_YAML
sed -i "s|%ORDERINGSERVICEENDPOINT%|$ORDERINGSERVICEENDPOINT|g" $CONNECTION_PROFILE_YAML
sed -i "s|%ORDERINGSERVICEENDPOINTNOPORT%|$ORDERINGSERVICEENDPOINTNOPORT|g" $CONNECTION_PROFILE_YAML
sed -i "s|%PEERSERVICEENDPOINT%|$PEERSERVICEENDPOINT|g" $CONNECTION_PROFILE_YAML
sed -i "s|%PEERSERVICEENDPOINTNOPORT%|$PEERSERVICEENDPOINTNOPORT|g" $CONNECTION_PROFILE_YAML
sed -i "s|%PEEREVENTENDPOINT%|$PEEREVENTENDPOINT|g" $CONNECTION_PROFILE_YAML
sed -i "s|%CASERVICEENDPOINT%|$CASERVICEENDPOINT|g" $CONNECTION_PROFILE_YAML
sed -i "s|%ADMINUSER%|$ADMINUSER|g" $CONNECTION_PROFILE_YAML
sed -i "s|%ADMINPWD%|$ADMINPWD|g" $CONNECTION_PROFILE_YAML

#copy the connection profiles to the lambda functions
cp $CONNECTION_PROFILE_YAML $LAMBDAREPODIR/ngo-lambda-register/config
cp $LAMBDAREPODIR/config/client-org.yaml $LAMBDAREPODIR/ngo-lambda-register/config

ls -lR $LAMBDAREPODIR/config