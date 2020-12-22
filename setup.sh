#!/bin/bash
source utils/menu.sh

MENU2=true
# Menu 2 - Installation
while [ $MENU2 = true ]
do
    clear
    # Menu 2 - Header and options
    declare -a menu2Options=("Enviroment variables setup" "System deployment" "(Optional) Lets-encrypt automatic certificates generation" "Go back" );
    generateDialog "options" "Deployment Menu - Follow steps in order. You can skip optional ones and do them by yourself if needed." "${menu2Options[@]}"
    # Reader
    echo -n "Select an option please: "
    read choice2

    if [ $choice2 = 1 ]
    then
        nano .env
    elif [ $choice2 = 2 ]
    then
        ./utils/deploy.sh
        # Stop
        echo -n "Press enter to continue."
        read nothing
    elif [ $choice2 = 3 ]
    then
        clear
        echo "-------------------------------------------------------------------------------------------"
        echo "Init Letsencrypt helps you by generating free SSL certificates automatically."
        echo "It is possible that your new DNS records are not updated yet in the different DNS servers." 
        echo "It is highly recommended to use this tool in staging mode until it succedes to make sure it will work and not being temporally banned by it."
        echo "- On failure, you should wait a bit for the dns to update and keep trying."
        echo "- On success, you can go ahead and not use the staging option as it should work."
        echo "-------------------------------------------------------------------------------------------"
        echo -n "Do you want to use the staging option? (Y/n) "
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
    elif [ $choice2 = 4 ]
    then
        MENU2=false
    fi
done

# Do something after getting their choice
clear