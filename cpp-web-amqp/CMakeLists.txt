cmake_minimum_required(VERSION 3.1...3.13)

project(
  cpp-web-amqp
  VERSION 1.0
  DESCRIPTION "cpp-web-amqp"
  LANGUAGES CXX)
  

file(GLOB_RECURSE sources "src/main/cpp/*.cpp")
file(GLOB_RECURSE headers "src/include/*.hpp")

set (include_dirs "")
foreach (_headerFile ${headers})
    get_filename_component(_dir ${_headerFile} PATH)
    list (APPEND include_dirs ${_dir})
endforeach()
list(REMOVE_DUPLICATES include_dirs)
message("${include_dirs}")

include_directories(${include_dirs})


add_executable (${CMAKE_PROJECT_NAME} ${sources})
link_directories ("/usr/lib/x86_64-linux-gnu/")
target_link_libraries(${CMAKE_PROJECT_NAME} optimized libqpid-proton-cpp.so)




