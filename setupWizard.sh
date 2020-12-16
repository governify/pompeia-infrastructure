#!/bin/bash
source menu.sh
MENU1=true

# Menu 1 - Welcome
while [ $MENU1 = true ]
do
    clear
    # Menu 1 - Header and options
    declare -a menu1Options=("Configure and deploy the system" "About" "Quit setup" );
    generateDialog "options" "Bluejay Setup Menu" "${menu1Options[@]}"
    # Reader
    echo -n "Select an option please: "
    read choice1

    if [ $choice1 = 1 ]
    then
        MENU2=true
        # Menu 2 - Installation
        while [ $MENU2 = true ]
        do
            clear
            # Menu 2 - Header and options
            declare -a menu2Options=("(Optional) Git, Docker and Docker Compose installation (AWS)" "Enviroment variables setup" "(Optional) Automatic DNS records generation (DynaHosting)" "System deployment" "(Optional) Lets-encrypt automatic certificates generation (Staging)" "(Optional) Lets-encrypt automatic certificates generation" "Go back" );
            generateDialog "options" "Deployment Menu - Follow steps in order. You can skip optional ones and do them by yourself if needed." "${menu2Options[@]}"
            # Reader
            echo -n "Select an option please: "
            read choice2

            if [ $choice2 = 1 ]
            then
                ./utils/preparation.sh
                # Stop
                echo -n "Press any key to continue."
                read nothing
            elif [ $choice2 = 2 ]
            then
                nano .env            
            elif [ $choice2 = 3 ]
            then
                # Read input
                echo -n "Please, enter your DynaHosting username: "
                read dynaHostingUsername
                echo -n "Please, enter your DynaHosting password: "
                read -s dynaHostingPassword

                # Execute script
                ./utils/createDNS.sh ${dynaHostingUsername} ${dynaHostingPassword}
                # Stop
                echo -n "Press any key to continue."
                read nothing
            elif [ $choice2 = 4 ]
            then
                clear
                declare -a menu3Options=("I want to use the Nginx. There is no running reverse proxy in this system" "Do not use it. I want to comment/remove the container from docker-compose.yaml (edit it here)" "I've already got rid of it. Go ahead" "Go back" );
                generateDialog "options" "Deploying the system will instantiate an Nginx to use it as a reverse proxy." "${menu3Options[@]}"
                # Reader
                echo -n "Select an option please: "
                read choice3

                if [ $choice3 = 2 ]
                then
                    nano ./docker-compose.yaml

                    ./setup.sh
                    # Stop
                    echo -n "Press any key to continue."
                    read nothing
                elif [ $choice3 = 4 ]
                then
                    echo ''                
                else
                    ./setup.sh
                    # Stop
                    echo -n "Press any key to continue."
                    read nothing
                fi 
            elif [ $choice2 = 5 ]
            then
                ./utils/init-letsencrypt.sh 1
                # Stop
                echo -n "Press any key to continue."
                read nothing    
            elif [ $choice2 = 6 ]
            then
                ./utils/init-letsencrypt.sh 0
                # Stop
                echo -n "Press any key to continue."
                read nothing          
            elif [ $choice2 = 7 ]
            then
                MENU2=false
            fi
        done
    elif [ $choice1 = 2 ]
    then
        clear
        echo ""
        echo "Bluejay ecosystem based in Governify (https://github.com/governify). Developed by ISA Group (https://www.isa.us.es). "
        # Stop
        echo -n "Press any key to continue."
        read nothing
    elif [ $choice1 = 3 ]
    then
        MENU1=false
    fi
done
# Do something after getting their choice
clear