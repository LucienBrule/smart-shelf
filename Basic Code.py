#Basic running of the program - Hanley (11/29/17)

#From the JSON code: foodname, quantity, date ("2017-12-06"), date-period ("2017-11-09/2017-12-06") -- NOT INCLUDING DP FOR NOW 
#From the sensors - 4 floats out to 6 digits 
#Current system removal cannot discern between two highly simmilar weights 

#Functions ---------------------------------------------------------------------

def check_item(ID):    #If user issues check_item prompt, then the fridge looks to see what they want 
    fn = raw_input("Enter food name => ") 
    for w in range(len(ID)):
        if ID[w][0] == fn:
            print 'Yes, you have', ID[w][1],'of',fn,'in fridge' 
            return 
    print 'No',fn,'were found in the fridge'
    return 
    
def add_item(weight, start):
    #prompt user to "add item" (returns the food variables as parameters)
    #waits until it recieves the variables 
    fn = raw_input("Enter food name => ") #foodname 
    #dp = date-period DO NOT INCLUDE DATE PERIODS FOR NOW 
    qt = raw_input("Enter quantity => ") #quantity 
    dt = raw_input("Enter date (YYYY-MM-DD) => ")
    ex = ''.join(c for c in "2017-12-06" if c.isdigit()) #date (potentially stored as a string of the numbers)
    #create an entry in the database labeled as its ID number 
    ID1 = [fn,qt,ex,abs(weight[0]-start[0]),abs(weight[1]-start[1]),abs(weight[2]-start[2]),abs(weight[3]-start[3]),abs(weight[4]-start[4])]
    print 'Item',ID1[0],'successfully added'
    return ID1   

def remove_item(weight, start, ID, delta): 
    #System goes through the food items and attempts to look for item removed 
    #Sets the quantity of that item to zero, (if it is not replaced within a certain period of time it will be deleted)
    #OTHERWISE - We will prompt the user to tell us whether the item will be replaced or not
    for i in range(len(ID)):
        if ID[i][7] > float(delta - 1) and ID[i][7] < float(delta + 1):
            ID[i][1] = 0 #initially removes the quantity of the item in the database
            ID[i][3] = 0
            ID[i][4] = 0
            ID[i][5] = 0
            ID[i][6] = 0
            ID[i][7] = 0
            print 'Removed', ID[i][0],'from shelf'
            return ID[i] 
    print("User must tell us what they removed, cannot tell") #If the smart shelf cannot tell what was removed 
    fn = raw_input("Enter food name => ")
    for i in range(len(ID)):
        if ID[i][0] == fn: 
            ID[i][1] = 0 #reset quantity in the fridge
            ID[i][3] = 0
            ID[i][4] = 0
            ID[i][5] = 0
            ID[i][6] = 0
            ID[i][7] = 0
            return ID[i]            
        
        
def return_item(weight, start, IDS): #NEED TO RESET WEIGHT 
    #prompt user to "return item" (returns food variables: foodname and quantity) 
    fn = raw_input("Enter food name => ") #User gives us the name of the item they are returning
    qt = raw_input("Enter quantity => ")  #User gives quantity of item they are returning 
    for i in range(len(ID)):
        if ID[i][0] == fn: 
            ID[i][1] = qt #reset quantity in the fridge
            ID[i][3] = abs(weight[0]-start[0])
            ID[i][4] = abs(weight[1]-start[1])
            ID[i][5] = abs(weight[2]-start[2])
            ID[i][6] = abs(weight[3]-start[3])
            ID[i][7] = abs(weight[4]-start[4])
            return ID[i]
    print 'System could not find item name you requested'
    #NEED a situation for when an item returned cannot be identified 
                
    
# Example database 
ID1 = ['Cheese', 3, '20171206', 4, 5, 6, 7, 22] #Each item stores its respective delta values rather than its actual readings
ID2 = ['Chicken', 2, '20171211', 12, 3, 3, 6, 24]
ID = [ID1,ID2,['Carrots', 0, '20171206', 0, 0, 0, 0, 0]] #Note: Not deemed to be the actual database 


#Get weight readings from the sensor every cycle  
start = [16,8,9,13,46] 
gone = [[['Carrots', 0, '20171206', 0, 0, 0, 0, 0],0]] #This will keep track of when we finally delete an item from the database 

#Start loop (Example loop runs n times) -----------------------------------------------------------
n = 10
z = 0
while z < n:
    print 'run',z+1,'--------------------------------------------------'
    w1 = float(raw_input("Enter weight sensor 1 => ")) #1 reading example
    w2 = float(raw_input("Enter weight sensor 2 => "))
    w3 = float(raw_input("Enter weight sensor 3 => "))
    w4 = float(raw_input("Enter weight sensor 4 => "))
    
    weight = [w1,w2,w3,w4,w1+w2+w3+w4]
    delta = weight[4] - start[4]
    print("Delta is ",delta)
    print("---------------------------------------------------")
    #If prompted, check for an item 
    check = raw_input("Do you want to check an item? (Y/N) => ")
    if check == "Y":
        check_item(ID)
    print("Checks the delta within a range--------------------")
    if delta > 1: #If the two weights disagree beyond the decided confidence level
        if len(gone) > 0: #Checks to see if the fridge is missing items from its inventory 
            voice = raw_input("User says return or add => ")
            if voice == "return": #If the user tells us they are returning an item 
                print 'Returning item'
                returned = return_item(weight, start, ID)
                for i in range(len(gone)): #removes the item from gone list 
                    if gone[i][0][0] == returned[0]:                
                        gone.remove(gone[i])                
            else: #If user says add
                print 'Adding item'
                ID.append(add_item(weight, start))
        
    elif delta < -1:
        print 'item was taken'
        #Prompt that an item has been taken 
        removed = [remove_item(weight, start, ID, delta),z]
        gone.append(removed) #The item removed is added to the gone list 
    
    print 'Gone check ----------------------------------------'
    w = 0
    print 'Before check gone has,',len(gone),'entries'
    while w < len(gone):
        if gone[w][0][1] > 0:
            gone.remove(gone[w])     #if quantity has been returned, it is removed from gone 
            print 'Item is returned from gone'
        elif (gone[w][1] - 5) > z:   # Determines when to remove an item from the database
            ID.remove(gone[w][0])
            gone.remove(gone[w])
            print 'Item is deleted from gone and ID'
        else: 
            gone[w][1] = (z+1)
            w += 1
            print 'Item continues to stay in gone and is incremented'
    
    print 'ID after run',z+1,'is',ID
    print 'Gone after run',z+1,'is',gone
    start = weight
    z += 1 

print 'Trial run successfully completed'
print 'Ending DB is,',ID
print 'Ending gone list is,',gone 



