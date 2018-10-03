#!/bin/bash

eosiocpp -o heymate.escrow.wast heymate.escrow.cpp
eosiocpp -g heymate.escrow.abi heymate.escrow.cpp
