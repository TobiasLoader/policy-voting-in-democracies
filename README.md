# policy-voting-in-democracies
Suggest policies on a 2d plane – see if the population vote it in.

Implementation of a simple voting system where policies are represented as points on a 2D plane and voters are represented by a distribution of points. The policies can be put to vote and the winner is determined by the distribution of voters. The file contains classes for Policy, NullPolicy, VoterDistribution, Button, and TextInfo. The main function is setup() which initializes the canvas and the objects. The function main() is responsible for drawing the UI and the objects. The function puttovote() is called when the "Put to Vote" button is clicked and it determines the outcome of the vote. The functions draw() and mouseClicked() handle the user input.
