#!/bin/bash

bu () {
    mkdir -p target
    cd target
    cmake ./../
    make
    cd ..
}

clean (){
    rm -r target
}

run (){
    ./target/cpp-web-amqp
}