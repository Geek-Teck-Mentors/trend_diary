#!/bin/bash

command=$1
exclude_functions=$2

for function_name in $(ls supabase/functions); do
  if [[ ! " ${exclude_functions[@]} " =~ " ${function_name} " ]]; then
    $command -c supabase/functions/${function_name}/deno.json
  fi
done
