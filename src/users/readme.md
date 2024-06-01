
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Get()
  findAll() {
    return this.usersService.findOnd();
  }
}




   LoginUser(email: string, password: string) {
    try {
      const user = this.userModel.findOne({ email });
      const isPasswordValid = bcrypt.compare(password, user.Password);

      if (!isPasswordValid) {
        throw new HttpException('CHECK YOUR LOGIN', HttpStatus.UNAUTHORIZED);
      }
      if(user && isPasswordValid){
        const { email, name } = user;
        return { email, name };
      }
    } catch (error) {
      throw new HttpException('CHECK YOUR LOGIN', HttpStatus.UNAUTHORIZED);
    }
  }
