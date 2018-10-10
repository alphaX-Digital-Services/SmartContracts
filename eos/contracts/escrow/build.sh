#!/bin/bash

eosiocpp -o escrow.wast escrow.cpp
eosiocpp -g escrow.abi escrow.cpp
