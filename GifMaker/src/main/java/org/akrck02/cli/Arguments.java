package org.akrck02.cli;

import java.util.Arrays;
import java.util.HashMap;

public class Arguments {

    HashMap<String, String> arguments = new HashMap<>();

    public Arguments(String[] args) {

        Arrays.stream(args)
        .filter(arg -> arg.startsWith("--"))
        .forEach(arg -> {
            String key = arg.substring(2, arg.lastIndexOf("="));
            String value = arg.substring(arg.lastIndexOf("=") + 1);
            arguments.put(key, value);
        });

    }

    public String get(String key) {
        return arguments.get(key);
    }

}
