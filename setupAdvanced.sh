#!/bin/bash
source utils/menu.sh

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
            declare -a menu2Options=("(Optional) Docker and Docker Compose installation (yum/AWS)" "Enviroment variables setup" "(Optional) Automatic DNS records generation (DynaHosting)" "System deployment" "(Optional) Lets-encrypt automatic certificates generation" "Go back" );
            generateDialog "options" "Deployment Menu - Follow steps in order. You can skip optional ones and do them by yourself if needed." "${menu2Options[@]}"
            # Reader
            echo -n "Select an option please: "
            read choice2

            if [ $choice2 = 1 ]
            then
                ./utils/preparation.sh
                # Stop
                echo -n "Press enter to continue."
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
                echo ""

                # Execute script
                ./utils/createDNS.sh ${dynaHostingUsername} ${dynaHostingPassword}
                # Stop
                echo -n "Press enter to continue."
                read nothing
            elif [ $choice2 = 4 ]
            then
                clear
                declare -a menu3Options=("I want to use the Nginx. There is no running reverse proxy in this system. Continue with the deployment" "Do not use it. I want to comment/remove the container from docker-compose.yaml (edit it here)" "I have already modified the docker-compose file. Continue with the deployment" "Go back" );
                generateDialog "options" "Deploying the system will instantiate an Nginx to use it as a reverse proxy." "${menu3Options[@]}"
                # Reader
                echo -n "Select an option please: "
                read choice3

                if [ $choice3 = 2 ]
                then
                    nano ./docker-compose.yaml

                    ./utils/deploy.sh
                    # Stop
                    echo -n "Press enter to continue."
                    read nothing
                elif [ $choice3 = 4 ]
                then
                    echo ''                
                else
                    ./utils/deploy.sh
                    # Stop
                    echo -n "Press enter to continue."
                    read nothing
                fi
            elif [ $choice2 = 5 ]
            then
                clear
                echo "-------------------------------------------------------------------------------------------"
                echo "Init Letsencrypt helps you by generating free SSL certificates automatically."
                echo "It is possible that your new DNS records are not updated yet in the different DNS servers." 
                echo "It is highly recommended to use this tool in staging mode until it succedes to make sure it will work and not being temporally banned by it."
                echo "- On failure, you should wait a bit for the dns to update and keep trying."
                echo "- On success, you can go ahead and not use the staging option as it should work."
                echo "-------------------------------------------------------------------------------------------"
                echo -n "Do you want to use the staging option? (y/N) "

                read choice4
                if [ $choice4 = "y" ] || [ $choice4 = "Y" ]
                then
                    ./utils/init-letsencrypt.sh 1
                    # Stop
                    echo -n "Press enter to continue."
                    read nothing
                else
                    ./utils/init-letsencrypt.sh 0
                    # Stop
                    echo -n "Press enter to continue."
                    read nothing
                fi          
            elif [ $choice2 = 6 ]
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
        echo -n "Press enter to continue."
        read nothing
    elif [ $choice1 = 3 ]
    then
        MENU1=false
    fi
done
# Do something after getting their choice
clear